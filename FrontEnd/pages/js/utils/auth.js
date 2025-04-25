// js/utils/auth.js
import { authService } from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';

const auth = {
  /** Vérifie si l'utilisateur est authentifié */
  get isLoggedIn() {
    return !!this.token && !!this.user;
  },

  /** Récupère l'utilisateur courant depuis le JWT ou localStorage */
  get user() {
    try {
      const token = this.token;
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.id, ...payload };
    } catch (e) {
      console.warn("❌ Impossible de décoder le token :", e);
      return null;
    }
  },

  /** Récupère le token d'authentification */
  get token() {
    return localStorage.getItem('token');
  },

  /** Déconnecte l'utilisateur et renvoie à l'accueil */
  logout() {
    console.log("🔐 Auth - Déconnexion en cours");
    showNotification('Déconnexion...', 'info');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /**
   * Si déjà connecté ET sur une page publique (login/register/index),
   * redirige vers le dashboard.
   * @returns {boolean} true si redirigé
   */
  redirectIfAuthenticated() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'login.html', 'register.html', ''];

    if (this.isLoggedIn && publicPages.includes(page)) {
      console.log("🔐 Auth - déjà connecté, redirection vers Dashboard");
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  },

  /**
   * Met à jour l'interface avec les infos de l'utilisateur (nom, domaine, avatar).
   */
  initUserInterface() {
    const user = this.user;
    if (!user) return;

    console.log("🔐 Auth - Initialisation de l'interface utilisateur");

    document.querySelectorAll('#sidebar-user-name, .user-name').forEach(el => {
      if (el) el.textContent = user.name;
    });

    const domainEl = document.getElementById('sidebar-user-domain');
    if (domainEl) {
      domainEl.textContent = user.domain || 'Inconnu';
      domainEl.classList.remove('medicine', 'law');
      domainEl.classList.add(user.domain === 'Médecine' ? 'medicine' : 'law');
    }

    const initials = user.name
      .split(' ')
      .map(n => n[0]?.toUpperCase() || '')
      .join('');
    const avatarEl = document.querySelector('.initials-avatar');
    if (avatarEl) avatarEl.textContent = initials;

    document.body.setAttribute('data-domain', user.domain || 'none');
  },

  /** Lie les boutons de déconnexion (.logout-btn, .logout-button) à logout() */
  setupLogoutButtons() {
    const buttons = document.querySelectorAll('.logout-btn, .logout-button');
    if (buttons.length === 0) return;

    console.log(`🔐 Auth - Configuration de ${buttons.length} bouton(s) de déconnexion`);

    buttons.forEach(btn => {
      btn.removeEventListener('click', this.logoutHandler);
      btn.addEventListener('click', this.logoutHandler);
    });
  },

  logoutHandler(e) {
    e.preventDefault();
    auth.logout();
  }
};

export default auth;
export { auth };
