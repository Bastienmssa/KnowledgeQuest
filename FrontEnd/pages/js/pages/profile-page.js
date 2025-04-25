import { auth } from '../utils/auth.js';
import api from '../api/api.js';
import { statsService } from '../services/stats-service.js';
import { qcmService } from '../services/qcm-service.js';
import { showMessage } from '../components/component.js';

export function initProfilePage() {
  console.log("✅ Initialisation de la page de profil...");
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  displayUserProfile();
  setupProfileForms();
  setupAvatarSelector();
  initProfileTabs();
  loadTestHistory();
  loadUserStats();
}

function displayUserProfile() {
  const user = auth.user;
  const { name, email, domain, avatar = 'homme.png', createdAt } = user;

  console.log("👤 Utilisateur chargé :", user);

  const elName = document.getElementById('profile-name');
  const elEmail = document.getElementById('profile-email');
  const elDomain = document.querySelector('.domain-text');
  const elJoinDate = document.querySelector('.join-date-text');

  if (!elName || !elEmail || !elDomain || !elJoinDate) {
    console.warn("❌ Élément(s) introuvable(s) dans le DOM pour le profil");
    return;
  }

  elName.textContent = name;
  elEmail.textContent = email;
  elDomain.textContent = domain;

  if (createdAt) {
    const d = new Date(createdAt);
    elJoinDate.textContent = `Membre depuis le ${d.toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    })}`;
  }

  const avatarImg = document.getElementById('profile-avatar-image');
  if (avatarImg) avatarImg.src = `images/avatars/${avatar}`;

  // Pré-remplir le formulaire
  document.getElementById('profile-firstname')?.value = name.split(' ')[0];
  document.getElementById('profile-lastname')?.value = name.split(' ').slice(1).join(' ');
  document.getElementById('profile-email-input')?.value = email;

  const domainSelect = document.getElementById('profile-domain-input');
  if (domainSelect) {
    Array.from(domainSelect.options).forEach(opt => {
      opt.selected = (opt.value === domain);
    });
  }

  document.getElementById('avatar-select-header')?.value = avatar;
  document.getElementById('avatar-select-form')?.value = avatar;
}

function setupProfileForms() {
  const profileForm = document.getElementById('personal-info-form');
  const passwordForm = document.getElementById('password-form');

  if (profileForm) {
    profileForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = `${profileForm.profileFirstname.value.trim()} ${profileForm.profileLastname.value.trim()}`;
      const email = profileForm.email.value.trim();
      const domain = profileForm.domain.value;
      const avatar = profileForm.avatar.value;

      try {
        const res = await api.user.updateProfile({ name, email, domain, avatar });
        if (res.success) {
          const updated = { ...auth.user, name, email, domain, avatar };
          localStorage.setItem('user', JSON.stringify(updated));
          showMessage(document.querySelector('.profile-messages'), 'Profil mis à jour ✅', 'success');
          displayUserProfile();
        } else {
          showMessage(document.querySelector('.profile-messages'), res.message || 'Erreur', 'error');
        }
      } catch (err) {
        console.error(err);
        showMessage(document.querySelector('.profile-messages'), 'Erreur serveur', 'error');
      }
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async e => {
      e.preventDefault();
      const currentPassword = document.getElementById('current-password')?.value.trim();
      const newPassword = document.getElementById('new-password')?.value.trim();

      if (!currentPassword || !newPassword) {
        showMessage(document.querySelector('.profile-messages'), 'Tous les champs sont requis.', 'error');
        return;
      }

      try {
        const res = await api.user.updatePassword({ currentPassword, newPassword });
        if (res.success) {
          showMessage(document.querySelector('.profile-messages'), 'Mot de passe mis à jour ✅', 'success');
          passwordForm.reset();
        } else {
          showMessage(document.querySelector('.profile-messages'), res.message || 'Erreur', 'error');
        }
      } catch (err) {
        console.error(err);
        showMessage(document.querySelector('.profile-messages'), 'Erreur serveur', 'error');
      }
    });
  }
}

function setupAvatarSelector() {
  const selHeader = document.getElementById('avatar-select-header');
  const selForm = document.getElementById('avatar-select-form');
  const img = document.getElementById('profile-avatar-image');

  [selHeader, selForm].forEach(sel => {
    if (!sel || !img) return;
    sel.addEventListener('change', () => {
      img.src = `images/avatars/${sel.value}`;
      if (sel === selHeader) selForm.value = sel.value;
      else selHeader.value = sel.value;
    });
  });
}

function initProfileTabs() {
  const buttons = document.querySelectorAll('.profile-tab-btn');
  const contents = document.querySelectorAll('.profile-tab-content');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-content`).style.display = 'block';
    });
  });
  buttons[0]?.click();
}

function loadTestHistory() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  api.user.getTestHistory()
    .then(res => {
      historyList.innerHTML = '';
      if (!res.success || !res.data?.length) {
        historyList.innerHTML = '<p>Aucun test trouvé.</p>';
        return;
      }
      res.data.forEach(test => {
        const d = new Date(test.date).toLocaleDateString('fr-FR');
        const div = document.createElement('div');
        div.className = 'test-entry';
        div.innerHTML = `
          <p><strong>QCM :</strong> ${test.qcmTitle || 'N/A'}</p>
          <p><strong>Score :</strong> ${test.score}%</p>
          <p><strong>Date :</strong> ${d}</p>
        `;
        historyList.appendChild(div);
      });
    })
    .catch(() => {
      historyList.innerHTML = '<p>Erreur lors du chargement de l’historique.</p>';
    });
}

async function loadUserStats() {
  try {
    const [stats, allQcms] = await Promise.all([
      statsService.getUserStats(),
      qcmService.getAllQcms()
    ]);
    document.getElementById('stat-tests').textContent = stats.scoresHistory?.length || 0;
    document.getElementById('stat-qcms').textContent = allQcms.filter(q => q.createdBy === auth.user.id).length;
    document.getElementById('stat-score').textContent = `${Math.round(stats.averageScore || 0)}%`;
  } catch (err) {
    console.warn("❌ Impossible de charger les statistiques :", err);
  }
}

document.addEventListener('DOMContentLoaded', initProfilePage);
