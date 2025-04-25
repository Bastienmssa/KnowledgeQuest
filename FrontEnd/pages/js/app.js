<<<<<<< HEAD
// app.js - Configuration globale de l'application
import { auth } from './utils/auth.js';
=======
// app.js - Point central d'initialisation de l'application
import auth from './utils/auth.js';
import { setupComponents } from './components/component.js';
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
import { setupPages } from './pages/pages.js';
import { initNavigation } from './components/navigation.js';
import { initNotifications } from './components/notification.js';

<<<<<<< HEAD
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
=======
// Variable pour éviter les initialisations multiples
let isInitialized = false;

export function initializeApp() {
  if (isInitialized) {
    console.log("🔄 Application déjà initialisée");
    return;
  }

  console.log("⚙️ Initialisation des composants de l'application...");

  // 1. Initialiser les composants globaux
  setupComponents();
  initNotifications();
  initNavigation();
  
  // 2. Initialiser l'interface utilisateur avec les infos utilisateur
  auth.initUserInterface();
  auth.setupLogoutButtons();
  
  // 3. Contrôler les accès et rediriger si nécessaire
  handleRedirections();
  
  // 4. Initialiser les pages spécifiques
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  setupPages(currentPage);
  
  isInitialized = true;
}

function handleRedirections() {
  const publicPages = ['index.html', 'login.html', 'register.html', ''];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (auth.isLoggedIn) {
    // Si connecté mais sur page publique -> dashboard
    if (publicPages.includes(currentPage)) {
      console.log("🔀 Utilisateur connecté sur page publique, redirection vers dashboard");
      window.location.href = 'dashboard.html';
    }
  } else {
    // Si non connecté mais sur page protégée -> login
    if (!publicPages.includes(currentPage)) {
      console.log("🔀 Utilisateur non connecté sur page protégée, redirection vers login");
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
      window.location.href = 'login.html';
    }
  }
}