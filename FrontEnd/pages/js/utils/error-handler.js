// js/utils/error-handler.js

export const ErrorHandler = {
  /**
   * Affiche une erreur visuellement dans l'élément spécifié ou dans une notification flottante.
   * @param {string} message - Message d'erreur à afficher
   * @param {string} [element=null] - ID d'un élément DOM optionnel pour afficher l'erreur
   */
  showError(message, element = null) {
    console.error('🚨 Erreur:', message);

    if (element) {
      const errorElement = document.getElementById(element);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.classList.add('error-message');
      }
    } else {
      const notification = document.createElement('div');
      notification.className = 'toast error-toast';
      notification.textContent = message;

      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 600);
      }, 4000);
    }
  },

  /**
   * Supprime l'affichage d'une erreur d'un élément spécifique
   * @param {string} element - ID de l'élément DOM
   */
  clearError(element) {
    const errorElement = document.getElementById(element);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      errorElement.classList.remove('error-message');
    }
  }
};
