/**
 * Gestionnaire pour la page de paramètres
 */
import { auth } from '../utils/auth.js'; 
import { showMessage } from '../components/component.js'; 
import api from '../api/api.js'; // Import API for direct calls

export function initSettingsPage() {
  console.log("Initialisation de la page de paramètres...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialiser les paramètres
  loadUserSettings();
  setupSettingsForm();
  setupLogoutButton();
  setupDeleteAccountButton();
}

function loadUserSettings() {
  // Charger les paramètres enregistrés
  const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  
  // Appliquer les paramètres
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.checked = settings.darkMode || false;
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    }
  }
  
  const notificationsToggle = document.getElementById('notifications-toggle');
  if (notificationsToggle) {
    notificationsToggle.checked = settings.notifications !== false; // Activé par défaut
  }
  
  const fontSizeSelect = document.getElementById('font-size');
  if (fontSizeSelect) {
    fontSizeSelect.value = settings.fontSize || 'medium';
    document.documentElement.setAttribute('data-font-size', settings.fontSize || 'medium');
  }
}

function setupSettingsForm() {
  // Gestionnaire pour le mode sombre
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
      const isDarkMode = darkModeToggle.checked;
      document.body.classList.toggle('dark-mode', isDarkMode);
      saveUserSetting('darkMode', isDarkMode);
    });
  }
  
  // Gestionnaire pour les notifications
  const notificationsToggle = document.getElementById('notifications-toggle');
  if (notificationsToggle) {
    notificationsToggle.addEventListener('change', () => {
      saveUserSetting('notifications', notificationsToggle.checked);
    });
  }
  
  // Gestionnaire pour la taille de police
  const fontSizeSelect = document.getElementById('font-size');
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener('change', () => {
      const fontSize = fontSizeSelect.value;
      document.documentElement.setAttribute('data-font-size', fontSize);
      saveUserSetting('fontSize', fontSize);
    });
  }
}

function saveUserSetting(key, value) {
  // Charger les paramètres existants
  const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  
  // Mettre à jour le paramètre
  settings[key] = value;
  
  // Enregistrer les paramètres
  localStorage.setItem('userSettings', JSON.stringify(settings));
  
  // Afficher un message de confirmation
  showMessage(
    document.querySelector('.settings-messages'),
    'Paramètres enregistrés',
    'success'
  );
}

function setupLogoutButton() {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      auth.logout();
    });
  }
}

function setupDeleteAccountButton() {
  const deleteAccountButton = document.getElementById('delete-account-button');
  if (deleteAccountButton) {
    deleteAccountButton.addEventListener('click', async () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
        try {
          // Use the API directly instead of fetch
          await api.user.deleteAccount();
          
          // Déconnecter l'utilisateur
          auth.logout();
          // Rediriger vers la page d'accueil
          window.location.href = 'index.html?deleted=true';
        } catch (error) {
          console.error('Erreur:', error);
          showMessage(
            document.querySelector('.settings-messages'),
            error.message || 'Erreur lors de la suppression du compte',
            'error'
          );
        }
      }
    });
  }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initSettingsPage);