/**
 * pages.js
 * Point d'entrée de l’application frontend pour gérer l’initialisation des différentes pages.
 */

import { initDashboardPage } from './dashboard-page.js';
import { initCreateQcmPage } from './create-qcm-page.js';
import { initTakeTestPage } from './take-test-page.js';
import { initStatsPage } from './stats-page.js';
import { initUploadPage } from './upload-page.js';
import { initResultsPage } from './results-page.js';
import { initProfilePage } from './profile-page.js';
import { initSettingsPage } from './settings-page.js';
// import { initRegisterPage } from './register-page.js';
// import { initLoginPage } from './login-page.js';
import { initHomePage } from './home-page.js'; // à créer si tu veux gérer home.html dynamiquement

/**
 * Initialisation des pages selon le nom de fichier HTML courant
 */
export function setupPages() {
  console.log("📄 Initialisation dynamique de la page...");

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  switch (currentPage) {
    case 'index.html':
    case '/':
    case '':
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
      console.warn(`⚠️ Aucune initialisation spécifique pour la page : ${currentPage}`);
  }
}
