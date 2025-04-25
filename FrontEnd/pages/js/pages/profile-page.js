<<<<<<< HEAD
import { auth } from '../utils/auth.js';
import api from '../api/api.js';
import { statsService } from '../services/stats-service.js';
import { qcmService } from '../services/qcm-service.js';
import { showMessage } from '../components/component.js';

export function initProfilePage() {
  console.log("✅ Initialisation de la page de profil...");
<<<<<<< HEAD

=======
// profile-page.js
import { auth } from '../utils/auth.js';
import api from '../api/api.js';
import { statsService } from '../services/stats-service.js';
import { qcmService }   from '../services/qcm-service.js';
import { showMessage }  from '../components/component.js';

export function initProfilePage() {
  console.log("✅ Initialisation de la page de profil...");
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
>>>>>>> AuthGoogle
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  displayUserProfile();
  setupProfileForms();
  setupAvatarSelector();
<<<<<<< HEAD
<<<<<<< HEAD
  loadTestHistory();
  loadUserStats();
  initProfileTabs();
=======
  initProfileTabs();
  loadTestHistory();
  loadUserStats();
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
  initProfileTabs();
  loadTestHistory();
  loadUserStats();
>>>>>>> AuthGoogle
}

function displayUserProfile() {
  const user = auth.user;
<<<<<<< HEAD
<<<<<<< HEAD
  if (!user) return;

=======
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
>>>>>>> AuthGoogle
  const { name, email, domain, avatar = 'homme.png', createdAt } = user;

  console.log("👤 Utilisateur chargé :", user);

<<<<<<< HEAD
<<<<<<< HEAD
  const joinDateElem = document.querySelector('.join-date-text');
  if (createdAt && joinDateElem) {
    const date = new Date(createdAt);
    joinDateElem.textContent = `Membre depuis le ${date.toLocaleDateString('fr-FR', {
=======
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
>>>>>>> AuthGoogle
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

<<<<<<< HEAD
  const avatarSelect = document.getElementById('avatar-select');
  if (avatarSelect) {
    avatarSelect.value = avatar;
  }
=======
  if (createdAt) {
    const d = new Date(createdAt);
    document.querySelector('.join-date-text').textContent =
      `Membre depuis le ${d.toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}`;
  }

  const avatarImg = document.getElementById('profile-avatar-image');
  if (avatarImg) avatarImg.src = `images/avatars/${avatar}`;

  // Pré-remplir le formulaire de modification
  document.getElementById('profile-firstname').value = name.split(' ')[0];
  document.getElementById('profile-lastname').value  = name.split(' ').slice(1).join(' ');
  document.getElementById('profile-email-input').value = email;

  const domainSelect = document.getElementById('profile-domain-input');
  Array.from(domainSelect.options).forEach(opt => {
    opt.selected = (opt.value === domain);
  });

  document.getElementById('avatar-select-header').value = avatar;
  document.getElementById('avatar-select-form').value   = avatar;
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
  document.getElementById('avatar-select-header')?.value = avatar;
  document.getElementById('avatar-select-form')?.value = avatar;
>>>>>>> AuthGoogle
}

function setupProfileForms() {
  const profileForm = document.getElementById('personal-info-form');
  const passwordForm = document.getElementById('password-form');

<<<<<<< HEAD
  if (profileForm) {
    profileForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = `${profileForm.profileFirstname.value.trim()} ${profileForm.profileLastname.value.trim()}`;
      const email = profileForm.email.value.trim();
=======
  // mise à jour des infos perso
  if (profileForm) {
    profileForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name   = `${profileForm.profileFirstname.value.trim()} ${profileForm.profileLastname.value.trim()}`;
      const email  = profileForm.email.value.trim();
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
      const domain = profileForm.domain.value;
      const avatar = profileForm.avatar.value;

      try {
<<<<<<< HEAD
<<<<<<< HEAD
        const response = await api.user.updateProfile({ name, email, domain, avatar });

        if (response.success) {
          const updatedUser = { ...auth.user, name, email, domain, avatar };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          showMessage(document.querySelector('.profile-messages'), '✅ Profil mis à jour', 'success');
          displayUserProfile();
        } else {
          showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur', 'error');
=======
        const res = await api.user.updateProfile({ name, email, domain, avatar });
        if (res.success) {
          const updated = { ...auth.user, name, email, domain, avatar };
          localStorage.setItem('user', JSON.stringify(updated));
          showMessage(document.querySelector('.profile-messages'), 'Profil mis à jour ✅', 'success');
          displayUserProfile();
        } else {
          showMessage(document.querySelector('.profile-messages'), res.message || 'Erreur', 'error');
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
        const res = await api.user.updateProfile({ name, email, domain, avatar });
        if (res.success) {
          const updated = { ...auth.user, name, email, domain, avatar };
          localStorage.setItem('user', JSON.stringify(updated));
          showMessage(document.querySelector('.profile-messages'), 'Profil mis à jour ✅', 'success');
          displayUserProfile();
        } else {
          showMessage(document.querySelector('.profile-messages'), res.message || 'Erreur', 'error');
>>>>>>> AuthGoogle
        }
      } catch (err) {
        console.error(err);
        showMessage(document.querySelector('.profile-messages'), 'Erreur serveur', 'error');
      }
    });
  }

<<<<<<< HEAD
  if (passwordForm) {
    passwordForm.addEventListener('submit', async e => {
      e.preventDefault();
<<<<<<< HEAD
  
      const currentPassword = document.getElementById('current-password').value.trim();
      const newPassword = document.getElementById('new-password').value.trim();
  
=======
  // changement de mot de passe
  if (passwordForm) {
    passwordForm.addEventListener('submit', async e => {
      e.preventDefault();
      const currentPassword = document.getElementById('current-password').value.trim();
      const newPassword     = document.getElementById('new-password').value.trim();

>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
      const currentPassword = document.getElementById('current-password')?.value.trim();
      const newPassword = document.getElementById('new-password')?.value.trim();

>>>>>>> AuthGoogle
      if (!currentPassword || !newPassword) {
        showMessage(document.querySelector('.profile-messages'), 'Tous les champs sont requis.', 'error');
        return;
      }
<<<<<<< HEAD
<<<<<<< HEAD
  
      try {
        const res = await api.user.updatePassword({ currentPassword, newPassword });
        if (res.success) {
          showMessage(document.querySelector('.profile-messages'), '✅ Mot de passe mis à jour', 'success');
=======

      try {
        const res = await api.user.updatePassword({ currentPassword, newPassword });
        if (res.success) {
          showMessage(document.querySelector('.profile-messages'), 'Mot de passe mis à jour ✅', 'success');
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======

      try {
        const res = await api.user.updatePassword({ currentPassword, newPassword });
        if (res.success) {
          showMessage(document.querySelector('.profile-messages'), 'Mot de passe mis à jour ✅', 'success');
>>>>>>> AuthGoogle
          passwordForm.reset();
        } else {
          showMessage(document.querySelector('.profile-messages'), res.message || 'Erreur', 'error');
        }
      } catch (err) {
<<<<<<< HEAD
<<<<<<< HEAD
        showMessage(document.querySelector('.profile-messages'), err.message || 'Erreur serveur', 'error');
=======
        console.error(err);
        showMessage(document.querySelector('.profile-messages'), 'Erreur serveur', 'error');
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
        console.error(err);
        showMessage(document.querySelector('.profile-messages'), 'Erreur serveur', 'error');
>>>>>>> AuthGoogle
      }
    });
  }
}

function setupAvatarSelector() {
<<<<<<< HEAD
<<<<<<< HEAD
  const avatarSelect = document.getElementById('avatar-select');
  const avatarPreview = document.getElementById('profile-avatar-image');
  if (!avatarSelect || !avatarPreview) return;
=======
  const selHeader = document.getElementById('avatar-select-header');
  const selForm = document.getElementById('avatar-select-form');
  const img = document.getElementById('profile-avatar-image');
>>>>>>> AuthGoogle

  [selHeader, selForm].forEach(sel => {
    if (!sel || !img) return;
    sel.addEventListener('change', () => {
      img.src = `images/avatars/${sel.value}`;
      if (sel === selHeader) selForm.value = sel.value;
      else selHeader.value = sel.value;
    });
<<<<<<< HEAD
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
=======
  const selHeader = document.getElementById('avatar-select-header');
  const selForm   = document.getElementById('avatar-select-form');
  const img       = document.getElementById('profile-avatar-image');
  [selHeader, selForm].forEach(sel => {
    if (!sel || !img) return;
    sel.addEventListener('change', () => {
      img.src = `images/avatars/${sel.value}`;
      // synchroniser l'autre select
      if (sel === selHeader) selForm.value = sel.value;
      else                  selHeader.value  = sel.value;
    });
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
>>>>>>> AuthGoogle
  });
}

function initProfileTabs() {
  const buttons = document.querySelectorAll('.profile-tab-btn');
  const contents = document.querySelectorAll('.profile-tab-content');
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> AuthGoogle
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

=======
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-content`).style.display = 'block';
    });
  });
  // ouvrir l'onglet actif au chargement
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
    // nombre de tests
    const testsCount = stats.scoresHistory?.length || 0;
    document.getElementById('stat-tests').textContent = testsCount;
    // nombre de QCM créés par l’utilisateur
    const myQcmCount = allQcms.filter(q => q.createdBy === auth.user.id).length;
    document.getElementById('stat-qcms').textContent = myQcmCount;
    // score moyen
    const avg = Math.round(stats.averageScore || 0);
    document.getElementById('stat-score').textContent = `${avg}%`;
  } catch (err) {
    console.warn("❌ Impossible de charger les statistiques :", err);
  }
}

// démarrage au chargement de la page
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
document.addEventListener('DOMContentLoaded', initProfilePage);
