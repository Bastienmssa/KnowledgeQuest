// js/services/auth-service.js
import { authAPI } from '../api/api.js';

export const authService = {
  /**
   * Enregistrer un nouvel utilisateur
   * @param {Object} userData - Données utilisateur
   */
  register: async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error) {
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
  },

  /**
   * Connecter un utilisateur
   * @param {string} email - Email
   * @param {string} password - Mot de passe
   */
  login: async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Stocker les informations de l'utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user || response));
      
      return response;
    } catch (error) {
      throw new Error(`Erreur lors de la connexion: ${error.message}`);
    }
  },

  /**
   * Déconnecter l'utilisateur
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rediriger vers la page de connexion
    window.location.href = '../pages/login.html';
  },

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser: () => {
    const userJSON = localStorage.getItem('user');
    return userJSON ? JSON.parse(userJSON) : null;
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Authentification Google
   * @param {string} token - Token Google
   */
  loginWithGoogle: async (token) => {
    try {
      const response = await authAPI.googleAuth(token);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      throw new Error(`Erreur d'authentification Google: ${error.message}`);
    }
  },

  /**
   * Authentification Microsoft
   * @param {string} token - Token Microsoft
   */
  loginWithMicrosoft: async (token) => {
    try {
      const response = await authAPI.microsoftAuth(token);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      throw new Error(`Erreur d'authentification Microsoft: ${error.message}`);
    }
  },

  /**
   * Mettre à jour le profil
   * @param {Object} profileData - Données du profil
   */
  updateProfile: async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Mettre à jour les informations locales
      const user = this.getCurrentUser();
      if (user) {
        localStorage.setItem('user', JSON.stringify({
          ...user,
          ...response.user
        }));
      }
      
      return response;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    }
  }
};