// js/utils/auth.js
import { authService } from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';

<<<<<<< HEAD
export const auth = {
  /**
   * Vérifie si l'utilisateur est authentifié
   */
=======
const auth = {
  /** Vérifie si l'utilisateur est authentifié */
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  get isLoggedIn() {
    return authService.isAuthenticated();
  },

<<<<<<< HEAD
  /**
   * Récupère le token de l'utilisateur
   */
  get token() {
    return localStorage.getItem('token');
  },

  /**
   * Récupère l'utilisateur courant
   */
=======
  /** Récupère l'utilisateur courant depuis le localStorage */
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  get user() {
    return authService.getCurrentUser();
  },

<<<<<<< HEAD
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
=======
  /** Récupère le token d'authentification */
  get token() {
    return localStorage.getItem('token');
  },

  /** Déconnecte l'utilisateur et renvoie à l'accueil */
  logout() {
    console.log("🔐 Auth - Déconnexion en cours");
    showNotification('Déconnexion...', 'info');
    authService.logout();
    // Redirection vers l'accueil après déconnexion
    window.location.href = 'index.html';
  },

  /**
   * Vérifie l'authentification.
   * Si non connecté, redirige vers login.html.
   * @returns {boolean} true si connecté
   */
  checkAuth() {
    if (!this.isLoggedIn) {
      console.log("🔐 Auth - non connecté, redirection vers Login");
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /**
<<<<<<< HEAD
   * Redirige vers dashboard si l'utilisateur est déjà connecté
   */
  redirectIfAuthenticated() {
    if (this.isLoggedIn) {
      console.log("Auth - Utilisateur déjà connecté, redirection vers dashboard");
=======
   * Si déjà connecté ET sur une page publique (login/register/index),
   * redirige vers le dashboard.
   * @returns {boolean} true si redirigé
   */
  redirectIfAuthenticated() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    
    if (this.isLoggedIn && publicPages.includes(page)) {
      console.log("🔐 Auth - déjà connecté, redirection vers Dashboard");
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  },

  /**
<<<<<<< HEAD
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
=======
   * Met à jour l'interface avec les infos de l'utilisateur (nom, domaine, avatar).
   */
  initUserInterface() {
    const user = this.user;
    if (!user) return;

    console.log("🔐 Auth - Initialisation de l'interface utilisateur");
    
    // Nom d'utilisateur
    document.querySelectorAll('#sidebar-user-name, .user-name').forEach(el => {
      if (el) el.textContent = user.name;
    });

    // Badge de domaine
    const domainEl = document.getElementById('sidebar-user-domain');
    if (domainEl) {
      domainEl.textContent = user.domain;
      domainEl.classList.remove('medicine', 'law');
      domainEl.classList.add(user.domain === 'Médecine' ? 'medicine' : 'law');
    }

    // Initiales pour l'avatar
    const initials = user.name
      .split(' ')
      .map(n => n[0]?.toUpperCase() || '')
      .join('');
    
    const avatarEl = document.querySelector('.initials-avatar');
    if (avatarEl) avatarEl.textContent = initials;

    // Attribut data-domain sur body pour thèmes
    document.body.setAttribute('data-domain', user.domain);
  },

  /**
   * Lie tous les boutons de déconnexion (.logout-btn, .logout-button) à notre logout()
   */
  setupLogoutButtons() {
    const buttons = document.querySelectorAll('.logout-btn, .logout-button');
    
    if (buttons.length === 0) return;
    
    console.log(`🔐 Auth - Configuration de ${buttons.length} bouton(s) de déconnexion`);
    
    buttons.forEach(btn => {
      // Retirer les écouteurs existants pour éviter les doublons
      btn.removeEventListener('click', this.logoutHandler);
      // Ajouter le nouvel écouteur
      btn.addEventListener('click', this.logoutHandler);
    });
  },
  
  // Handler séparé pour faciliter la suppression de l'écouteur
  logoutHandler(e) {
    e.preventDefault();
    auth.logout();
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  }
};

export default auth;
<<<<<<< HEAD
=======
export { auth };
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
