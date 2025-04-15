/**
 * Point d'entrée JavaScript de l'application Knowledge Quest
 * Responsable du rendu de l'application dans le DOM
 */

import { initializeApp } from './app.js';
import { setupComponents } from './components/component.js';
import { setupPages } from './pages/pages.js';
import { setupAPI } from './api/api.js';
import { auth } from './utils/auth.js';
import { router } from './utils/router.js';

document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log("Knowledge Quest app initializing...");

  // Vérifier l'authentification
  auth.checkAuth();

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