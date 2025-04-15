// js/services/document-service.js
import api from '../api/api.js';

export const documentService = {
  async uploadDocument(file, metadata) {
    try {
      const response = await api.document.upload(file, metadata);
      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getUserDocuments() {
    try {
      const response = await api.document.getUserDocuments();
      return response.data;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  },

  async getDocumentById(id) {
    try {
      const response = await api.document.getDocumentById(id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  },

  async deleteDocument(id) {
    try {
      await api.document.deleteDocument(id);
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  },

  isValidFileType(file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return allowedTypes.includes(file.type);
  },

  isValidFileSize(file, maxSize = 10) {
    const maxSizeInBytes = maxSize * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeInBytes;
  }
};

export default documentService;