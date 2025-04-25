<<<<<<< HEAD
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
=======
// services/settings-service.js
import api from '../api/api.js';
import { notifySuccess, notifyError } from '../components/notification.js';
import { applyStylePreferences } from '../utils/style.js';

export const settingsService = {
  async getSettings() {
    try {
      const response = await api.user.getSettings();
      if (response && response.success) {
        // Sauvegarder les paramètres dès réception
        localStorage.setItem('userSettings', JSON.stringify(response.settings));
        
        // Appliquer immédiatement les styles
        applyStylePreferences(response.settings);
      }
      return response;
    } catch (error) {
      console.error('Erreur récupération paramètres :', error);
      
      // Tenter d'utiliser les paramètres en cache si disponibles
      const cached = localStorage.getItem('userSettings');
      if (cached) {
        try {
          const settings = JSON.parse(cached);
          return { success: true, settings };
        } catch (e) {
          console.error('Erreur parsing paramètres en cache:', e);
        }
      }
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
      throw error;
    }
  },

<<<<<<< HEAD
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
=======
  async updateSettings(settings) {
    try {
      // Mettre à jour dans localStorage immédiatement, même avant l'API
      // pour une réponse UI immédiate
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Appliquer les styles immédiatement
      applyStylePreferences(settings);
      
      // Diffuser le changement à toutes les pages
      this.broadcastSettingsChange(settings);
      
      // Envoyer à l'API en arrière-plan
      const response = await api.user.updateSettings(settings);
      
      if (response && response.success) {
        notifySuccess('Paramètres mis à jour avec succès');
        return response;
      } else {
        throw new Error(response?.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur maj paramètres :', error);
      notifyError('Impossible de mettre à jour les paramètres');
      throw error;
    }
  },
  
  broadcastSettingsChange(settings) {
    console.log('Diffusion du changement de paramètres à toutes les pages');
    
    // Utiliser une promesse pour s'assurer que l'événement est bien envoyé
    return new Promise(resolve => {
      // setTimeout 0 pour sortir du contexte actuel et éviter les problèmes d'événement
      setTimeout(() => {
        const event = new CustomEvent('settings-updated', { 
          detail: settings,
          bubbles: true,
          cancelable: true
        });
        
        window.dispatchEvent(event);
        console.log('Événement settings-updated envoyé avec succès');
        resolve();
      }, 0);
    });
  }
};
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
