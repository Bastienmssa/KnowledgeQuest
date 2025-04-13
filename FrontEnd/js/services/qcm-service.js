// js/services/qcm-service.js
import { qcmAPI } from '../api/api.js';

export const qcmService = {
  /**
   * Récupérer tous les QCM
   * @param {Object} filters - Filtres pour les QCM
   */
  getAllQcms: async (filters = {}) => {
    try {
      const response = await qcmAPI.getQCMs(filters);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des QCM:', error);
      throw error;
    }
  },

  /**
   * Récupérer un QCM par son ID
   * @param {string} id - ID du QCM
   */
  getQcmById: async (id) => {
    try {
      const response = await qcmAPI.getQCMById(id);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du QCM ${id}:`, error);
      throw error;
    }
  },

  /**
   * Créer un nouveau QCM
   * @param {Object} qcmData - Données du QCM
   */
  createQcm: async (qcmData) => {
    try {
      const response = await qcmAPI.createQCM(qcmData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du QCM:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un QCM
   * @param {string} id - ID du QCM
   * @param {Object} qcmData - Données du QCM
   */
  updateQcm: async (id, qcmData) => {
    try {
      const response = await qcmAPI.updateQCM(id, qcmData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du QCM ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un QCM
   * @param {string} id - ID du QCM
   */
  deleteQcm: async (id) => {
    try {
      const response = await qcmAPI.deleteQCM(id);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la suppression du QCM ${id}:`, error);
      throw error;
    }
  },

  /**
   * Générer un QCM à partir d'un document
   * @param {string} documentId - ID du document
   * @param {string} subject - Matière
   */
  generateQcm: async (documentId, subject) => {
    try {
      const response = await qcmAPI.generateQCM(documentId, subject);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du QCM:', error);
      throw error;
    }
  }
};