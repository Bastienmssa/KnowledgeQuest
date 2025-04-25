/**
 * Point d'entrée JavaScript de l'application Knowledge Quest
<<<<<<< HEAD
 * Responsable du rendu de l'application dans le DOM
 */

import { initializeApp } from './app.js';
import { setupComponents } from './components/component.js';
import { setupPages } from './pages/pages.js';
import { setupAPI } from './api/api.js';
import { auth } from './utils/auth.js';
import { router } from './utils/router.js';
import { applyStylePreferences } from './utils/style.js'; // Ajout important

document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log("Knowledge Quest app initializing...");

  // Vérifier l'authentification
  auth.checkAuth();

  // Appliquer le thème / style utilisateur
  applyStylePreferences(); // Appliquer les préférences de style

  // Initialiser les composants
  setupComponents();

  // Initialiser les pages
  setupPages();

  // Initialiser les services API
  setupAPI();

  // Initialiser le routeur
  router.init();

  // Initialiser l'application principale
  initializeApp();

  console.log("Knowledge Quest app initialized successfully!");
}
=======
 */

import { initializeApp } from './app.js';
import { auth } from './utils/auth.js';
import { setupAPI } from './api/api.js';
import { initStyles } from './utils/style.js';

// Garantit que l'initialisation ne se fait qu'une seule fois
let appInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
  if (appInitialized) return;
  
  console.log("🚀 Knowledge Quest - Initialisation...");
  
  // Exposer les services globalement
  window.api = setupAPI();
  window.auth = auth;
  
  // Initialiser les styles avant tout
  initStyles();
  
  // Initialiser l'application principale
  initializeApp();
  
  appInitialized = true;
  console.log("✅ Knowledge Quest - Initialisation terminée");
});
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
