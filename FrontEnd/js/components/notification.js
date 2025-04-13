// js/components/notification.js
/**
 * Module pour gérer les notifications dans l'application
 */

// Stockage des notifications actives
const activeNotifications = [];
let notificationContainer = null;

export function initNotifications() {
  console.log("Initializing notifications system...");
  
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