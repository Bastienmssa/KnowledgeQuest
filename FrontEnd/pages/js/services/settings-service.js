// js/services/settings-service.js
import { auth } from '../utils/auth.js';

export const settingsService = {
  /**
   * Récupérer les paramètres utilisateur depuis le serveur
   */
  async getSettings() {
    try {
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getToken()}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Impossible de charger les paramètres');
      }

      return data.settings;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres :', error);
      throw error;
    }
  },

  /**
   * Mettre à jour les paramètres utilisateur sur le serveur
   */
  async updateSettings(settings) {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour des paramètres');
      }

      return data.settings;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres :', error);
      throw error;
    }
  }
};
