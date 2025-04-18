/**
 * Module de gestion des notifications utilisateur
 * Affiche des messages de type : success, error, info, warning
 */

const activeNotifications = [];
let notificationContainer = null;

export function initNotifications() {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }

  initNotificationStyles();
}

export function showNotification(message, type = 'info', duration = 5000) {
  if (!notificationContainer) initNotifications();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  const icon = getNotificationIcon(type);

  notification.innerHTML = `
    <span class="notification-icon">${icon}</span>
    <span class="notification-message">${message}</span>
    <button class="notification-close">&times;</button>
  `;

  notificationContainer.appendChild(notification);
  activeNotifications.push(notification);

  setTimeout(() => {
    notification.classList.add('visible');
  }, 10);

  notification.querySelector('.notification-close').addEventListener('click', () => {
    closeNotification(notification);
  });

  if (duration > 0) {
    setTimeout(() => closeNotification(notification), duration);
  }
}

function closeNotification(notification) {
  notification.classList.remove('visible');
  notification.classList.add('hide');
  setTimeout(() => {
    if (notification.parentNode) notification.parentNode.removeChild(notification);
    const index = activeNotifications.indexOf(notification);
    if (index > -1) activeNotifications.splice(index, 1);
  }, 300);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info':
    default: return 'ℹ️';
  }
}

function initNotificationStyles() {
  if (document.getElementById('notification-style')) return;

  const style = document.createElement('style');
  style.id = 'notification-style';
  style.innerHTML = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .notification {
      background: #fff;
      color: #333;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 250px;
      max-width: 350px;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .notification.visible {
      transform: translateX(0);
      opacity: 1;
    }

    .notification.hide {
      transform: translateX(100%);
      opacity: 0;
    }

    .notification-icon {
      margin-right: 10px;
    }

    .notification-success {
      border-left: 4px solid #4CAF50;
    }

    .notification-error {
      border-left: 4px solid #F44336;
    }

    .notification-info {
      border-left: 4px solid #2196F3;
    }

    .notification-warning {
      border-left: 4px solid #FFC107;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
    }
  `;
  document.head.appendChild(style);
}

// Méthodes rapides
export function notifySuccess(message, duration = 5000) {
  showNotification(message, 'success', duration);
}

export function notifyError(message, duration = 6000) {
  showNotification(message, 'error', duration);
}

export function notifyInfo(message, duration = 5000) {
  showNotification(message, 'info', duration);
}

export function notifyWarning(message, duration = 5000) {
  showNotification(message, 'warning', duration);
}
