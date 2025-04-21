import api from '../api/api.js';

export const authService = {
  async register(userData) {
    try {
      console.log("AuthService - Register - Données envoyées:", userData);
      const response = await api.auth.register(userData);
      console.log("AuthService - Register - Réponse reçue:", response);

      if (response.token) {
        const user = response.user || {
          name: userData.name,
          email: userData.email,
          domain: userData.domain,
          _id: response._id,
          avatar: 'homme.png'
        };
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response;
    } catch (error) {
      console.error('AuthService - Erreur pendant l\'inscription:', error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      console.log("AuthService - Login - Données envoyées:", credentials);
      const response = await api.auth.login(credentials);
      console.log("AuthService - Login - Réponse reçue:", response);

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('AuthService - Erreur pendant la connexion:', error);
      throw error;
    }
  },

  async loginWithGoogle(googleToken) {
    try {
      console.log("AuthService - LoginWithGoogle - Token reçu");
      const response = await api.auth.googleAuth(googleToken);
      console.log("AuthService - LoginWithGoogle - Réponse reçue");

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('AuthService - Erreur pendant l\'authentification Google:', error);
      throw error;
    }
  },

  logout() {
    console.log("AuthService - Déconnexion de l'utilisateur");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async getProfile() {
    console.log("AuthService - Récupération du profil utilisateur");
    const response = await api.user.getProfile();
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },

  async updateProfile(profileData) {
    console.log("AuthService - Mise à jour du profil - Données:", profileData);
    const response = await api.user.updateProfile(profileData);
    console.log("AuthService - Mise à jour du profil - Réponse:", response);

    if (response.success && response.data) {
      const updatedUser = { ...this.getCurrentUser(), ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return response;
  }
};

export default authService;
