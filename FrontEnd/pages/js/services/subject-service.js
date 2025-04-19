// js/services/subject-service.js
import api from '../api/api.js';

export const subjectService = {
  async getAllSubjects() {
    try {
      const response = await api.subject.getAll();
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erreur récupération de toutes les matières:', error);
      throw error;
    }
  },

  async getSubjectsByDomain(domain) {
    try {
      const response = await api.subject.getByDomain(domain);
      console.log('📦 Réponse matières domaine :', response);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erreur récupération des matières par domaine:', error);
      throw error;
    }
  },

  async getSubjectByName(name) {
    try {
      const response = await api.subject.getByName(name);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Erreur récupération de la matière ${name}:`, error);
      throw error;
    }
  },

  async createSubject(data) {
    try {
      const response = await api.subject.create(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Erreur création matière:', error);
      throw error;
    }
  }
};

export default subjectService;
