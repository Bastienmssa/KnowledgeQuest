// js/services/document-service.js
import api from '../api/api.js';

export const documentService = {
  async uploadDocument(fileOrFormData, onProgress) {
    try {
      let formData;
      
      // Vérifier si l'argument est déjà un FormData
      if (fileOrFormData instanceof FormData) {
        formData = fileOrFormData;
      } else {
        // C'est un fichier, créer un FormData
        formData = new FormData();
        formData.append('document', fileOrFormData);
      }
      
      // Log pour déboguer
      console.log("Envoi du FormData à l'API...");
      
      const response = await api.document.upload(formData, onProgress);
      return response.document || response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  isValidFileType(file) {
    if (!file) return false;
    
    // Vérification par extension en plus du type MIME
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    // Vérification par type MIME
    const validMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    // Accepter si l'extension OU le type MIME est valide
    return hasValidExtension || validMimeTypes.includes(file.type);
  },

  isValidFileSize(file, maxSize = 10) {
    if (!file) return false;
    const maxSizeInBytes = maxSize * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeInBytes;
  }
};

export default documentService;