// js/utils/auth.js
import { authService } from '../services/auth-service.js';

export const auth = {
  isLoggedIn: false,
  user: null,
  
  init() {
    this.user = authService.getCurrentUser();
    this.isLoggedIn = authService.isAuthenticated();
    
    // Vérifier si le token est valide
    if (this.isLoggedIn) {
      this.validateToken();
    }
  },
  
  async validateToken() {
    try {
      await authService.getMe();
    } catch (error) {
      console.error("Erreur lors de la validation du token:", error);
      this.logout();
    }
  },
  
  async login(email, password) {
    try {
      const response = await authService.login(email, password);
      this.isLoggedIn = true;
      this.user = response.user || response;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  async register(userData) {
    try {
      const response = await authService.register(userData);
      this.isLoggedIn = true;
      this.user = response.user || response;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  logout() {
    authService.logout();
    this.isLoggedIn = false;
    this.user = null;
  },
  
  checkAuth() {
    return this.isLoggedIn;
  }
};

// Initialiser l'authentification au chargement
document.addEventListener('DOMContentLoaded', () => {
  auth.init();
  window.auth = auth;
});