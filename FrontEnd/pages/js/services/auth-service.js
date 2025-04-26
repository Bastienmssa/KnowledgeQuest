// js/services/auth-service.js
import api from '../api/api.js';
import { showNotification } from '../components/notification.js';
import { signInWithGooglePopup } from '../utils/firebase-auth.js';

export const authService = {
  async register(data) {
    const res = await api.auth.register(data);
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      window.dispatchEvent(new CustomEvent('auth:login', { detail: res.user }));
    }
    return res;
  },

  async login(creds) {
    const res = await api.auth.login(creds);
    if (res.token && res.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      window.dispatchEvent(new CustomEvent('auth:login', { detail: res.user }));
    }
    return res;
  },

  async loginWithGoogle() {
    try {
      const { token, user } = await signInWithGooglePopup();
      const res = await api.auth.loginWithGoogle({ token });
      if (res.token && res.user) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.dispatchEvent(new CustomEvent('auth:login', { detail: res.user }));
      } else {
        showNotification(res.message || "Échec de l'authentification Google", "error");
      }
    } catch (err) {
      console.error("❌ Erreur Google Firebase:", err);
      showNotification("Erreur de connexion avec Google", "error");
    }
  },

  logout() {
    window.dispatchEvent(new CustomEvent('auth:logout'));
    localStorage.clear();
    window.location.href = 'login.html';
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
export default authService;