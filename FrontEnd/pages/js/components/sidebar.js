import { authService } from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const logoutBtn = document.getElementById('logout-button');
  const userNameDisplay = document.getElementById('sidebar-user-name');
  const userDomainDisplay = document.getElementById('sidebar-user-domain');

  // Gestion du toggle de la sidebar
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const toggleIcon = toggleBtn.querySelector('.toggle-icon');
      toggleIcon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    });
  }

  // Gestion de la déconnexion
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
    });
  }

  // Récupération des infos utilisateur
  const user = authService.getCurrentUser();

  if (!user) {
    // Sécurité : si pas connecté, on redirige
    window.location.href = 'login.html';
    return;
  }

  // Affichage du nom
  if (userNameDisplay) {
    userNameDisplay.textContent = user.name;
  }

  // Affichage du domaine + badge couleur
  if (userDomainDisplay) {
    userDomainDisplay.textContent = user.domain;

    userDomainDisplay.classList.remove('medicine', 'law');
    if (user.domain.toLowerCase().includes('médecine')) {
      userDomainDisplay.classList.add('medicine');
    } else if (user.domain.toLowerCase().includes('droit')) {
      userDomainDisplay.classList.add('law');
    }
  }
});
