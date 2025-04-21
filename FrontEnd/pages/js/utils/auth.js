// js/utils/auth.js
import { authService } from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';

export const auth = {
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  get isLoggedIn() {
    return authService.isAuthenticated();
  },

  /**
   * Récupère le token de l'utilisateur
   */
  get token() {
    return localStorage.getItem('token');
  },

  /**
   * Récupère l'utilisateur courant
   */
  get user() {
    return authService.getCurrentUser();
  },

  /**
   * Déconnecte l'utilisateur
   */
  logout() {
    console.log("Auth - Déconnexion");
    showNotification('Déconnexion en cours...', 'info');
    authService.logout();
  },

  /**
   * Vérifie l'authentification sinon redirige vers login
   */
  checkAuth() {
    if (!this.isLoggedIn) {
      console.log("Auth - Utilisateur non connecté, redirection vers login");
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /**
   * Redirige vers dashboard si l'utilisateur est déjà connecté
   */
  redirectIfAuthenticated() {
    if (this.isLoggedIn) {
      console.log("Auth - Utilisateur déjà connecté, redirection vers dashboard");
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  },

  /**
   * Met à jour l’interface avec les informations de l’utilisateur connecté
   */
  initUserInterface() {
    const user = this.user;

    if (user) {
      console.log("Auth - Initialisation de l'interface utilisateur");

      const nameElements = document.querySelectorAll('#sidebar-user-name, .user-name');
      nameElements.forEach(el => {
        el.textContent = user.name;
      });

      const domainElement = document.getElementById('sidebar-user-domain');
      if (domainElement) {
        domainElement.textContent = user.domain;
        domainElement.classList.remove('medicine', 'law');
        domainElement.classList.add(user.domain === 'Médecine' ? 'medicine' : 'law');
      }

      const avatarInitials = user.name
        .split(' ')
        .map(n => n[0].toUpperCase())
        .join('');
      const avatarElement = document.querySelector('.initials-avatar');
      if (avatarElement) avatarElement.textContent = avatarInitials;

      document.body.setAttribute('data-domain', user.domain);
    }
  },

  /**
   * Initialise les boutons de déconnexion présents sur la page
   */
  setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll('.logout-btn, .logout-button');

    console.log(`Auth - Configuration de ${logoutButtons.length} bouton(s) de déconnexion`);

    logoutButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });
  }
};

export default auth;
