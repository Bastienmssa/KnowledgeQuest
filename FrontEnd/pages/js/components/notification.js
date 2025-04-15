// js/components/notification.js
/**
 * Module pour gérer les notifications dans l'application
 */

// Stockage des notifications actives
const activeNotifications = [];
let notificationContainer = null;

export function initNotifications() {
  console.log("Initialisation du système de notifications...");
  
  // Créer le conteneur de notifications s'il n'existe pas
  createNotificationContainer();
  
  // Initialiser les notifications en attente
  processQueuedNotifications();
}

function createNotificationContainer() {
  if (document.getElementById('notification-container')) return;
  
  notificationContainer = document.createElement('div');
  notificationContainer.id = 'notification-container';
  notificationContainer.className = 'notification-container';
  document.body.appendChild(notificationContainer);
}

export function showNotification(message, type = 'info', duration = 5000) {
  // Si le conteneur n'est pas prêt, mettre en file d'attente
  if (!notificationContainer) {
    queueNotification(message, type, duration);
    return;
  }
  
  console.log(`Notification (${type}): ${message}`);
  
  // Créer l'élément de notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Ajouter une icône selon le type
  const icon = getNotificationIcon(type);
  
  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <p>${message}</p>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  // Ajouter au conteneur
  notificationContainer.appendChild(notification);
  
  // Ajouter à la liste des notifications actives
  activeNotifications.push(notification);
  
  // Animation d'entrée
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Configuration du bouton de fermeture
  const closeButton = notification.querySelector('.notification-close');
  closeButton.addEventListener('click', () => {
    closeNotification(notification);
  });
  
  // Fermeture automatique après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      closeNotification(notification);
    }, duration);
  }
  
  return notification;
}

function closeNotification(notification) {
  // Animation de sortie
  notification.classList.remove('show');
  notification.classList.add('hide');
  
  // Supprimer après l'animation
  setTimeout(() => {
    if (notification.parentNode === notificationContainer) {
      notificationContainer.removeChild(notification);
    }
    
    // Supprimer de la liste des notifications actives
    const index = activeNotifications.indexOf(notification);
    if (index !== -1) {
      activeNotifications.splice(index, 1);
    }
  }, 300); // Durée de l'animation CSS
}

export function clearAllNotifications() {
  // Copier le tableau pour éviter les problèmes lors de la modification
  const notifications = [...activeNotifications];
  
  notifications.forEach(notification => {
    closeNotification(notification);
  });
}

const notificationQueue = [];

function queueNotification(message, type, duration) {
  notificationQueue.push({ message, type, duration });
}

function processQueuedNotifications() {
  while (notificationQueue.length > 0) {
    const { message, type, duration } = notificationQueue.shift();
    showNotification(message, type, duration);
  }
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
}

export function notifySuccess(message, duration = 5000) {
  return showNotification(message, 'success', duration);
}

export function notifyError(message, duration = 8000) {
  return showNotification(message, 'error', duration);
}

export function notifyWarning(message, duration = 7000) {
  return showNotification(message, 'warning', duration);
}

export function notifyInfo(message, duration = 5000) {
  return showNotification(message, 'info', duration);
}

// Initialiser les styles nécessaires pour les notifications
function initNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 350px;
    }
    
    .notification {
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 10px;
      padding: 15px;
      display: flex;
      align-items: center;
      transform: translateX(100%);
      transition: transform 0.3s ease-out, opacity 0.3s ease;
      opacity: 0;
      overflow: hidden;
      position: relative;
    }
    
    .notification.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .notification.hide {
      transform: translateX(100%);
      opacity: 0;
    }
    
    .notification-icon {
      margin-right: 12px;
      font-size: 20px;
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-content p {
      margin: 0;
      line-height: 1.5;
    }
    
    .notification-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      margin-left: 10px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    
    .notification-close:hover {
      opacity: 1;
    }
    
    .notification-success {
      border-left: 4px solid #4CAF50;
    }
    
    .notification-error {
      border-left: 4px solid #F44336;
    }
    
    .notification-warning {
      border-left: 4px solid #FF9800;
    }
    
    .notification-info {
      border-left: 4px solid #2196F3;
    }
  `;
  
  document.head.appendChild(style);
}

// Modifier initNotifications pour inclure les styles
export function initNotifications() {
  console.log("Initialisation du système de notifications...");
  
  // Ajouter les styles
  initNotificationStyles();
  
  // Créer le conteneur de notifications
  createNotificationContainer();
  
  // Initialiser les notifications en attente
  processQueuedNotifications();
}