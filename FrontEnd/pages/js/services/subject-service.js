// js/services/subject-service.js
import api from '../api/api.js';

export const subjectService = {
  async getAllSubjects() {
    try {
      const response = await api.subject.getAll();
      return response;
    } catch (error) {
      console.error('Error fetching all subjects:', error);
      throw error;
    }
  },

  async getSubjectsByDomain(domain) {
    try {
      const response = await api.subject.getByDomain(domain);
      return response;
    } catch (error) {
      console.error('Error fetching subjects by domain:', error);
      throw error;
    }
  },

  async getSubjectByName(name) {
    try {
      const response = await api.subject.getByName(name);
      return response;
    } catch (error) {
      console.error(`Error fetching subject ${name}:`, error);
      throw error;
    }
  },

  async createSubject(data) {
    try {
      const response = await api.subject.create(data);
      return response;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }
};

export default subjectService;
