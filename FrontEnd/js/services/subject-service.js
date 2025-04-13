// js/services/subject-service.js
import { subjectAPI } from '../api/api.js';

export const subjectService = {
  /**
   * Récupérer toutes les matières
   */
  getAllSubjects: async () => {
    try {
      const response = await subjectAPI.getAllSubjects();
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des matières:', error);
      throw error;
    }
  },

  /**
   * Récupérer une matière par son nom
   * @param {string} name - Nom de la matière
   */
  getSubjectByName: async (name) => {
    try {
      const response = await subjectAPI.getSubjectByName(name);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la matière ${name}:`, error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle matière
   * @param {Object} subjectData - Données de la matière
   */
  createSubject: async (subjectData) => {
    try {
      const response = await subjectAPI.createSubject(subjectData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la matière:', error);
      throw error;
    }
  },

  /**
   * Récupérer les thèmes d'une matière
   * @param {string} subjectName - Nom de la matière
   */
  getTopicsForSubject: async (subjectName) => {
    try {
      const subject = await this.getSubjectByName(subjectName);
      return subject.topics || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des thèmes pour ${subjectName}:`, error);
      return [];
    }
  }
};