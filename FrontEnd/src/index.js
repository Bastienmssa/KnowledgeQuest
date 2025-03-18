/**
 * Point d'entrée JavaScript de l'application Knowledge Quest
 * Responsable du rendu de l'application dans le DOM
 */

// Importation des modules nécessaires
import { initializeApp } from './app.js';
import { setupComponents } from './component/component.js';
import { setupPages } from './pages/pages.js';
import { setupAPI } from './api.js';

// Fonction d'initialisation principale
function init() {
    console.log("Knowledge Quest app initializing...");
    
    // Initialiser les composants
    setupComponents();
    
    // Initialiser les pages
    setupPages();
    
    // Initialiser les services API
    setupAPI();
    
    // Initialiser l'application principale
    initializeApp();
    
    console.log("Knowledge Quest app initialized successfully!");
}

// Exécuter l'initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', init);

// Exporter pour être utilisé par d'autres modules
export default init;