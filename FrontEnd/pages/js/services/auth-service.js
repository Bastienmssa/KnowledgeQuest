import api from '../api/api.js';

export const authService = {
<<<<<<< HEAD
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
=======
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

  logout() {
    window.dispatchEvent(new CustomEvent('auth:logout'));
    localStorage.clear();
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
    window.location.href = 'login.html';
  },

  getCurrentUser() {
<<<<<<< HEAD
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
=======
    return JSON.parse(localStorage.getItem('user') || 'null');
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
<<<<<<< HEAD
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

=======
  }
};
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
export default authService;
