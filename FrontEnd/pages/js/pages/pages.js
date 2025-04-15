/**
 * Contient des fichiers pour les différentes pages ou vues de l'application
 * Chaque page peut être composée de plusieurs composants
 */

import { initDashboardPage } from './dashboard-page.js';
import { initCreateQcmPage } from './create-qcm-page.js';
import { initTakeTestPage } from './take-test-page.js';
import { initStatsPage } from './stats-page.js';
import { initUploadPage } from './upload-page.js';
import { initResultsPage } from './results-page.js';
import { initProfilePage } from './profile-page.js';
import { initSettingsPage } from './settings-page.js';

// Fonction d'initialisation des pages
export function setupPages() {
  console.log("Setting up application pages...");

  // Déterminer quelle page est actuellement chargée
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Initialiser la page appropriée
  switch (currentPage) {
    case 'index.html':
    case '/':
      initHomePage();
      break;
    case 'register.html':
      initRegisterPage();
      break;
    case 'login.html':
      initLoginPage();
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
    default:
      console.log(`No specific initialization for page: ${currentPage}`);
      initHomePage(); // Fallback à la page d'accueil
  }
}