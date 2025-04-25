// js/services/qcm-service.js
import api from '../api/api.js';

export const qcmService = {
  async getAllQcms(filters = {}) {
    try {
      const response = await api.qcm.getAll(filters);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('❌ Erreur récupération des QCMs :', error);
      throw error;
    }
  },

  async getQcmById(id) {
    try {
      const response = await api.qcm.getById(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`❌ Erreur récupération du QCM ${id} :`, error);
      throw error;
    }
  },

  async createQcm(qcmData) {
    try {
      const response = await api.qcm.create(qcmData);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('❌ Erreur création du QCM :', error);
      throw error;
    }
  },

  async updateQcm(id, qcmData) {
    try {
      const response = await api.qcm.update(id, qcmData);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`❌ Erreur mise à jour du QCM ${id} :`, error);
      throw error;
    }
  },

  async deleteQcm(id) {
    try {
      await api.qcm.delete(id);
    } catch (error) {
      console.error(`❌ Erreur suppression du QCM ${id} :`, error);
      throw error;
    }
  },

  async generateQcm(documentId, subject) {
    try {
      const response = await api.qcm.generateQcm({ 
        documentId, 
        subject,
        model: 'gpt-3.5-turbo' // Utiliser un modèle moins coûteux
      });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('❌ Erreur génération de QCM :', error);
      throw error;
    }
  },
  
  async generateQcmFromDocument(documentId, subject) {
    try {
      const response = await api.qcm.generateQcm({ documentId, subject });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('❌ Erreur génération de QCM :', error);
      throw error;
    }
  }
};

export default qcmService;