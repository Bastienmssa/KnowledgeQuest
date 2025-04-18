/**
 * Gestionnaire pour la page de profil
 */
import { auth } from '../utils/auth.js';
import { KnowledgeQuestAPI } from '../api/api.js';
import { showMessage } from '../components/component.js';

export function initProfilePage() {
  console.log("Initialisation de la page de profil...");

  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  displayUserProfile();
  setupProfileForms();
  initProfileTabs();
}

function displayUserProfile() {
  if (!auth.user) return;

  const name = auth.user.name || '-';
  const email = auth.user.email || '-';
  const domain = auth.user.domain || '-';
  const createdAt = auth.user.createdAt || null;

  // Avatar & Infos principales
  const initials = getInitials(name);
  const avatarElem = document.querySelector('#profile-avatar .initials-avatar');
  if (avatarElem) avatarElem.textContent = initials;

  const nameElem = document.getElementById('profile-name');
  const emailElem = document.getElementById('profile-email');
  const domainText = document.querySelector('#profile-domain .domain-text');
  const joinDateText = document.querySelector('#profile-join-date .join-date-text');

  if (nameElem) nameElem.textContent = name;
  if (emailElem) emailElem.textContent = email;
  if (domainText) domainText.textContent = domain;

  if (joinDateText && createdAt) {
    const date = new Date(createdAt);
    joinDateText.textContent = `Membre depuis le ${date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
  }

  // Statistiques (score, QCM, tests)
  KnowledgeQuestAPI.stats.getUserStats().then(stats => {
    document.getElementById("stat-tests").textContent = stats?.scoresHistory?.length || 0;
    document.getElementById("stat-qcms").textContent = stats?.qcmCount || 0;
    document.getElementById("stat-score").textContent = `${Math.round(stats?.averageScore || 0)}%`;
  }).catch(() => {
    console.warn("Impossible de charger les statistiques.");
  });

  // Pré-remplir formulaire
  const nameSplit = name.split(' ');
  const firstName = nameSplit[0];
  const lastName = nameSplit.slice(1).join(' ');

  document.getElementById('profile-firstname')?.setAttribute('value', firstName);
  document.getElementById('profile-lastname')?.setAttribute('value', lastName);
  document.getElementById('profile-email-input')?.setAttribute('value', email);

  const domainSelect = document.getElementById('profile-domain-input');
  if (domainSelect) {
    Array.from(domainSelect.options).forEach(option => {
      option.selected = (option.value === domain);
    });
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

function setupProfileForms() {
  const profileForm = document.getElementById('personal-info-form');
  const passwordForm = document.getElementById('password-form');

  // 🧾 Modifier infos personnelles
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = `${profileForm.profileFirstname.value} ${profileForm.profileLastname.value}`;
      const email = profileForm.email.value;
      const domain = profileForm.domain.value;

      try {
        const response = await KnowledgeQuestAPI.user.updateProfile({ name, email, domain });

        if (response.success) {
          auth.user = { ...auth.user, name, email, domain };
          localStorage.setItem("user", JSON.stringify(auth.user));
          showMessage(document.querySelector('.profile-messages'), 'Profil mis à jour avec succès', 'success');
          displayUserProfile();
        } else {
          showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur lors de la mise à jour', 'error');
        }
      } catch (err) {
        console.error(err);
        showMessage(document.querySelector('.profile-messages'), 'Erreur lors de la mise à jour du profil', 'error');
      }
    });
  }

  // 🔐 Changer le mot de passe
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPassword = passwordForm.currentPassword.value;
      const newPassword = passwordForm.newPassword.value;
      const confirmPassword = passwordForm.confirmPassword.value;

      if (newPassword !== confirmPassword) {
        showMessage(document.querySelector('.profile-messages'), 'Les mots de passe ne correspondent pas', 'error');
        return;
      }

      try {
        const res = await KnowledgeQuestAPI.user.updatePassword(currentPassword, newPassword);
        if (res.success) {
          showMessage(document.querySelector('.profile-messages'), 'Mot de passe mis à jour avec succès', 'success');
          passwordForm.reset();
        } else {
          showMessage(document.querySelector('.profile-messages'), res.message || 'Erreur lors du changement', 'error');
        }
      } catch (err) {
        showMessage(document.querySelector('.profile-messages'), 'Erreur serveur', 'error');
      }
    });
  }
}

function initProfileTabs() {
  const buttons = document.querySelectorAll('.profile-tab-btn');
  const contents = document.querySelectorAll('.profile-tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.getElementById(`${target}-content`).style.display = 'block';
    });
  });

  // Onglet actif par défaut
  if (buttons.length > 0) buttons[0].click();
}

document.addEventListener('DOMContentLoaded', initProfilePage);
