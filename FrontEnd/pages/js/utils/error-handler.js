// js/utils/error-handler.js
export const ErrorHandler = {
    showError(message, element = null) {
      console.error('Application error:', message);
  
      if (element) {
        const errorElement = document.getElementById(element);
        if (errorElement) {
          errorElement.textContent = message;
          errorElement.style.display = 'block';
        }
      } else {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
  
        document.body.appendChild(notification);
  
        setTimeout(() => {
          notification.classList.add('fade-out');
          setTimeout(() => notification.remove(), 500);
        }, 5000);
      }
    },
  
    clearError(element) {
      const errorElement = document.getElementById(element);
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }
  };