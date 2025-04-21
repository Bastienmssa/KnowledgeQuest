import { auth } from '../utils/auth.js';
import api from '../api/api.js';
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
  loadTestHistory();
  loadUserStats();
  initProfileTabs();
}

function displayUserProfile() {
  const user = auth.user;
  if (!user) return;

  const { name, email, domain, avatar = 'homme.png', createdAt } = user;

  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = email;
  document.querySelector('.domain-text').textContent = domain;

  const joinDateElem = document.querySelector('.join-date-text');
  if (createdAt && joinDateElem) {
    const date = new Date(createdAt);
    joinDateElem.textContent = `Membre depuis le ${date.toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    })}`;
  }

  const avatarElem = document.getElementById('profile-avatar-image');
  if (avatarElem) avatarElem.src = `images/avatars/${avatar}`;

  document.getElementById('profile-firstname').value = name.split(' ')[0];
  document.getElementById('profile-lastname').value = name.split(' ').slice(1).join(' ');
  document.getElementById('profile-email-input').value = email;

  const domainSelect = document.getElementById('profile-domain-input');
  if (domainSelect) {
    [...domainSelect.options].forEach(opt => {
      opt.selected = (opt.value === domain);
    });
  }

  const avatarSelect = document.getElementById('avatar-select');
  if (avatarSelect) {
    avatarSelect.value = avatar;
  }
}

function setupProfileForms() {
  const profileForm = document.getElementById('personal-info-form');
  const passwordForm = document.getElementById('password-form');

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = `${profileForm.profileFirstname.value.trim()} ${profileForm.profileLastname.value.trim()}`;
      const email = profileForm.email.value.trim();
      const domain = profileForm.domain.value;
      const avatar = profileForm.avatar.value;

      try {
        const response = await api.user.updateProfile({ name, email, domain, avatar });

        if (response.success) {
          const updatedUser = { ...auth.user, name, email, domain, avatar };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          showMessage(document.querySelector('.profile-messages'), '✅ Profil mis à jour', 'success');
          displayUserProfile();
        } else {
          showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur', 'error');
        }
      } catch (err) {
        console.error(err);
        showMessage(document.querySelector('.profile-messages'), 'Erreur serveur', 'error');
      }
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const currentPassword = document.getElementById('current-password').value.trim();
      const newPassword = document.getElementById('new-password').value.trim();
  
      if (!currentPassword || !newPassword) {
        showMessage(document.querySelector('.profile-messages'), 'Tous les champs sont requis.', 'error');
        return;
      }
  
      try {
        const res = await api.user.updatePassword({ currentPassword, newPassword });
        if (res.success) {
          showMessage(document.querySelector('.profile-messages'), '✅ Mot de passe mis à jour', 'success');
          passwordForm.reset();
        } else {
          showMessage(document.querySelector('.profile-messages'), res.message || 'Erreur', 'error');
        }
      } catch (err) {
        showMessage(document.querySelector('.profile-messages'), err.message || 'Erreur serveur', 'error');
      }
    });
  }
}

function setupAvatarSelector() {
  const avatarSelect = document.getElementById('avatar-select');
  const avatarPreview = document.getElementById('profile-avatar-image');
  if (!avatarSelect || !avatarPreview) return;

  avatarSelect.addEventListener('change', () => {
    const selected = avatarSelect.value;
    avatarPreview.src = `images/avatars/${selected}`;
  });
}

function loadTestHistory() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  api.user.getTestHistory().then(res => {
    historyList.innerHTML = '';

    if (!res.success || !res.data?.length) {
      historyList.innerHTML = `<p>Aucun test trouvé.</p>`;
      return;
    }

    res.data.forEach(test => {
      const div = document.createElement('div');
      div.className = 'test-entry';
      div.innerHTML = `
        <p><strong>QCM :</strong> ${test.qcmTitle}</p>
        <p><strong>Score :</strong> ${test.score}%</p>
        <p><strong>Date :</strong> ${new Date(test.date).toLocaleDateString('fr-FR')}</p>
      `;
      historyList.appendChild(div);
    });
  }).catch(() => {
    historyList.innerHTML = `<p>Erreur lors du chargement de l’historique.</p>`;
  });
}

function loadUserStats() {
  api.stats.getUserStats().then(stats => {
    document.getElementById("stat-tests").textContent = stats?.scoresHistory?.length || 0;
    document.getElementById("stat-qcms").textContent = stats?.qcmCount || 0;
    document.getElementById("stat-score").textContent = `${Math.round(stats?.averageScore || 0)}%`;
  }).catch(() => {
    console.warn("❌ Impossible de charger les statistiques.");
  });
}

function initProfileTabs() {
  const buttons = document.querySelectorAll('.profile-tab-btn');
  const contents = document.querySelectorAll('.profile-tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => (c.style.display = 'none'));

      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.getElementById(`${target}-content`).style.display = 'block';
    });
  });

  if (buttons.length) buttons[0].click();
}

document.addEventListener('DOMContentLoaded', initProfilePage);
