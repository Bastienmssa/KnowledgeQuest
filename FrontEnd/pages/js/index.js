/**
 * Point d'entrée JavaScript de l'application Knowledge Quest
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