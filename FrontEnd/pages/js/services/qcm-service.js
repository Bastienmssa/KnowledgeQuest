// js/services/qcm-service.js
import api from '../api/api.js';

export const qcmService = {
  async getAllQcms(filters = {}) {
    try {
      const response = await api.qcm.getAll(filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching QCMs:', error);
      throw error;
    }
  },

  async getQcmById(id) {
    try {
      const response = await api.qcm.getById(id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching QCM ${id}:`, error);
      throw error;
    }
  },

  async createQcm(qcmData) {
    try {
      const response = await api.qcm.create(qcmData);
      return response.data;
    } catch (error) {
      console.error('Error creating QCM:', error);
      throw error;
    }
  },

  async updateQcm(id, qcmData) {
    try {
      const response = await api.qcm.update(id, qcmData);
      return response.data;
    } catch (error) {
      console.error(`Error updating QCM ${id}:`, error);
      throw error;
    }
  },

  async deleteQcm(id) {
    try {
      await api.qcm.delete(id);
    } catch (error) {
      console.error(`Error deleting QCM ${id}:`, error);
      throw error;
    }
  },

  async generateQcmFromDocument(documentId, subject) {
    try {
      const response = await api.qcm.generateQcm(documentId, subject);
      return response.data;
    } catch (error) {
      console.error('Error generating QCM:', error);
      throw error;
    }
  }
};

export default qcmService;