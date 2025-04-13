// js/services/document-service.js
import { documentAPI } from '../api/api.js';

export const documentService = {
  /**
   * Télécharger un document sur le serveur
   * @param {File} file - Fichier à télécharger
   * @param {Function} onProgress - Fonction de callback pour la progression
   */
  uploadDocument: async (file, onProgress) => {
    try {
      const response = await documentAPI.uploadDocument(file, onProgress);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw error;
    }
  },

  /**
   * Télécharger un document depuis le serveur
   * @param {string} filename - Nom du fichier
   */
  downloadDocument: (filename) => {
    try {
      documentAPI.downloadDocument(filename);
    } catch (error) {
      console.error(`Erreur lors du téléchargement du fichier ${filename}:`, error);
      throw error;
    }
  },

  /**
   * Vérifier si un fichier est d'un type autorisé
   * @param {File} file - Fichier à vérifier
   */
  isValidFileType: (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return allowedTypes.includes(file.type);
  },

  /**
   * Vérifier si un fichier a une taille valide
   * @param {File} file - Fichier à vérifier
   * @param {number} maxSize - Taille maximale en Mo
   */
  isValidFileSize: (file, maxSize = 10) => {
    const maxSizeInBytes = maxSize * 1024 * 1024; // Convertir Mo en octets
    return file.size <= maxSizeInBytes;
  }
};