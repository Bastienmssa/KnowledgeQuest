// js/utils/auth.js
import { authService } from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';

export const auth = {
  get isLoggedIn() {
    return authService.isAuthenticated();
  },

  get token() {
    return localStorage.getItem('token');
  },

  get user() {
    return authService.getCurrentUser();
  },

  logout() {
    console.log("Auth - Déconnexion");
    showNotification('Déconnexion en cours...', 'info');
    authService.logout();
  },

  checkAuth() {
    if (!this.isLoggedIn) {
      console.log("Auth - Utilisateur non connecté, redirection vers login");
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  redirectIfAuthenticated() {
    if (this.isLoggedIn) {
      console.log("Auth - Utilisateur déjà connecté, redirection vers dashboard");
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  },

  initUserInterface() {
    const user = this.user;
    
    if (user) {
      console.log("Auth - Initialisation de l'interface utilisateur");
      const userNameElements = document.querySelectorAll('.user-name');
      userNameElements.forEach(el => {
        el.textContent = user.name;
      });
      
      // Ajouter un attribut au body pour stylisation spécifique au domaine
      document.body.setAttribute('data-domain', user.domain);
    }
  },

  setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll('.logout-button');
    console.log(`Auth - Configuration de ${logoutButtons.length} boutons de déconnexion`);
    
    logoutButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });
  }
};

export default auth;