// app.js - Configuration globale de l'application
import { auth } from './utils/auth.js';
import { setupPages } from './pages/pages.js';
import { initNavigation } from './components/navigation.js';
import { initNotifications } from './components/notification.js';

export function initializeApp() {
  console.log("Initializing main application components...");
  
  // Initialiser les notifications
  initNotifications();
  
  // Initialiser la navigation
  initNavigation();
  
  // Configurer les pages
  setupPages();
  
  // Vérifier le statut d'authentification
  checkAuthStatus();
}

function checkAuthStatus() {
  const protectedPages = [
    'dashboard.html', 
    'create-qcm.html', 
    'upload-document.html',
    'stats.html',
    'profile.html',
    'settings.html',
    'results.html'
  ];
  
  const currentPage = window.location.pathname.split('/').pop();
  
  if (auth.isLoggedIn) {
    // Si l'utilisateur est connecté mais sur la page de login ou register
    if (currentPage === 'login.html' || currentPage === 'register.html') {
      window.location.href = 'dashboard.html';
    }
  } else {
    // Si l'utilisateur n'est pas connecté mais tente d'accéder à une page protégée
    if (protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
}