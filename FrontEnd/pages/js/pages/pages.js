<<<<<<< HEAD
<<<<<<< HEAD
/**
 * pages.js
 * Point d'entrée de l’application frontend pour gérer l’initialisation des différentes pages.
 */

import { initDashboardPage } from './dashboard-page.js';
import { initCreateQcmPage } from './create-qcm-page.js';
import { initTakeTestPage } from './take-test-page.js';
=======
// pages.js - Initialisation spécifique de chaque page
import { initDashboardPage } from './dashboard-page.js';
import { initCreateQcmPage } from './create-qcm-page.js';
// Correction du chemin d'importation - utilise le nom de fichier correct
import { initTakeTestPage } from './take-test-page.js'; // Correct
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
// pages.js - Initialisation spécifique de chaque page
import { initDashboardPage } from './dashboard-page.js';
import { initCreateQcmPage } from './create-qcm-page.js';
// Correction du chemin d'importation - utilise le nom de fichier correct
import { initTakeTestPage } from './take-test-page.js'; // Correct
>>>>>>> AuthGoogle
import { initStatsPage } from './stats-page.js';
import { initUploadPage } from './upload-page.js';
import { initResultsPage } from './results-page.js';
import { initProfilePage } from './profile-page.js';
import { initSettingsPage } from './settings-page.js';
<<<<<<< HEAD
<<<<<<< HEAD
// import { initRegisterPage } from './register-page.js';
// import { initLoginPage } from './login-page.js';
import { initHomePage } from './home-page.js'; // à créer si tu veux gérer home.html dynamiquement
=======
import { initLoginPage } from './login-page.js';
import { initRegisterPage } from './register-page.js';
import { initHomePage } from './home-page.js';
>>>>>>> AuthGoogle

// Suivi des pages déjà initialisées
const initialized = new Set();

export function setupPages(pageName) {
  if (!pageName) {
    pageName = window.location.pathname.split('/').pop() || 'index.html';
  }
<<<<<<< HEAD
}
=======
import { initLoginPage } from './login-page.js';
import { initRegisterPage } from './register-page.js';
import { initHomePage } from './home-page.js';

// Suivi des pages déjà initialisées
const initialized = new Set();

export function setupPages(pageName) {
  if (!pageName) {
    pageName = window.location.pathname.split('/').pop() || 'index.html';
  }
=======
>>>>>>> AuthGoogle
  
  if (initialized.has(pageName)) {
    console.log(`📄 Page ${pageName} déjà initialisée, aucune action nécessaire`);
    return;
  }
  
  console.log(`📄 Initialisation de la page: ${pageName}`);
  
  try {
    switch (pageName) {
      case 'login.html':
        initLoginPage();
        break;
      case 'register.html':
        initRegisterPage();
        break;
      case 'dashboard.html':
        initDashboardPage();
        break;
      case 'create-qcm.html':
        initCreateQcmPage();
        break;
      case 'take-test.html':
        initTakeTestPage();
        break;
      case 'stats.html':
        initStatsPage();
        break;
      case 'upload-document.html':
        initUploadPage();
        break;
      case 'results.html':
        initResultsPage();
        break;
      case 'profile.html':
        initProfilePage();
        break;
      case 'settings.html':
        initSettingsPage();
        break;
      case 'index.html':
      case '':
        initHomePage();
        break;
      default:
        console.warn(`❓ Pas de fonction d'initialisation pour la page ${pageName}`);
    }
    
    // Marquer la page comme initialisée
    initialized.add(pageName);
  } catch (error) {
    console.error(`❌ Erreur lors de l'initialisation de la page ${pageName}:`, error);
  }
<<<<<<< HEAD
}
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
}
>>>>>>> AuthGoogle
