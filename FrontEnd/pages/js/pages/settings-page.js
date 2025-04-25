<<<<<<< HEAD
/**
 * Gestionnaire pour la page de paramètres
 */
import { auth } from '../utils/auth.js';
import { showMessage } from '../components/component.js';
import { settingsService } from '../services/settings-service.js';
import api from '../api/api.js';

export async function initSettingsPage() {
  console.log("Initialisation de la page de paramètres...");

  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  await loadUserSettings();
  setupTabs();
  setupSaveButton();
  setupLogoutButton();
  setupDeleteAccountButton();
}

async function loadUserSettings() {
  try {
    const settings = await settingsService.getSettings();

    document.getElementById('theme-toggle').checked = settings.darkMode || false;
    document.getElementById('font-size').value = settings.fontSize || 'medium';
    document.querySelector(`input[name="theme"][value="${settings.colorTheme || 'medicine'}"]`).checked = true;

    document.getElementById('email-notifications').checked = settings.emailNotifications !== false;
    document.getElementById('quiz-reminders').checked = settings.quizReminders !== false;
    document.getElementById('reminder-frequency').value = settings.reminderFrequency || 'weekly';

    document.getElementById('data-sharing').checked = settings.dataSharing !== false;
    document.getElementById('document-retention').value = settings.documentRetention || '7';

    document.getElementById('learning-mode').value = settings.learningMode || 'random';
    document.getElementById('question-time').value = settings.questionTime || '30';
    document.getElementById('daily-goal').value = settings.dailyGoal || 20;

    if (settings.darkMode) document.body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-font-size', settings.fontSize || 'medium');
  } catch (error) {
    console.error("Erreur de chargement des paramètres :", error);
    showMessage(document.querySelector('.settings-messages'), "Impossible de charger les paramètres.", 'error');
  }
}

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.settings-tab-content');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      contents.forEach(content => content.style.display = 'none');

      button.classList.add('active');
      const target = document.getElementById(`${button.dataset.tab}-tab`);
      if (target) target.style.display = 'block';
    });
  });
}

function setupSaveButton() {
  document.getElementById('save-settings-btn').addEventListener('click', async () => {
    const settings = {
      darkMode: document.getElementById('theme-toggle').checked,
      fontSize: document.getElementById('font-size').value,
      colorTheme: document.querySelector('input[name="theme"]:checked')?.value,

      emailNotifications: document.getElementById('email-notifications').checked,
      quizReminders: document.getElementById('quiz-reminders').checked,
      reminderFrequency: document.getElementById('reminder-frequency').value,

      dataSharing: document.getElementById('data-sharing').checked,
      documentRetention: document.getElementById('document-retention').value,

      learningMode: document.getElementById('learning-mode').value,
      questionTime: document.getElementById('question-time').value,
      dailyGoal: parseInt(document.getElementById('daily-goal').value),
    };

    try {
      await settingsService.updateSettings(settings);

      document.body.classList.toggle('dark-mode', settings.darkMode);
      document.documentElement.setAttribute('data-font-size', settings.fontSize);

      showMessage(document.querySelector('.settings-messages'), 'Paramètres enregistrés', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      showMessage(document.querySelector('.settings-messages'), 'Impossible d’enregistrer les paramètres.', 'error');
    }
  });
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
  const deleteButton = document.getElementById('delete-account-btn');
  if (deleteButton) {
    deleteButton.addEventListener('click', async () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
        try {
          await api.user.deleteAccount();
          auth.logout();
          window.location.href = 'index.html?deleted=true';
        } catch (error) {
          console.error('Erreur:', error);
          showMessage(document.querySelector('.settings-messages'), error.message || 'Erreur lors de la suppression du compte', 'error');
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initSettingsPage);
=======
// pages/settings-page.js
import { settingsService } from '../services/settings-service.js';
import { showNotification, notifySuccess, notifyError } from '../components/notification.js';
import { applyStylePreferences } from '../utils/style.js';

export async function initSettingsPage() {
  console.log("Initialisation de la page de paramètres...");
  
  const messagesContainer = document.querySelector('.settings-messages');
  
  // Fonction de message pour afficher dans le conteneur de messages
  function showMessage(container, message, type = 'info') {
    if (!container) return;
    
    // Créer un élément de message
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // Ajouter le message et le supprimer après un délai
    container.innerHTML = '';
    container.appendChild(messageEl);
    
    // Également envoyer une notification
    showNotification(message, type);
    
    // Supprimer le message après 5 secondes
    setTimeout(() => {
      if (container.contains(messageEl)) {
        container.removeChild(messageEl);
      }
    }, 5000);
  }
  
  setupTabs();
  await loadUserSettings();
  setupSaveButton();
  setupLogoutButton();
  setupDeleteAccountButton();
  
  // Écouteur d'événements pour recevoir les changements de paramètres d'autres pages
  window.addEventListener('settings-updated', (e) => {
    console.log("Mise à jour des paramètres reçue sur la page settings:", e.detail);
    // Mettre à jour l'UI si nécessaire - si les changements viennent d'ailleurs
    if (!e.detail._fromSettingsPage) {
      loadSettingsIntoForm(e.detail);
    }
  });

  async function loadUserSettings() {
    try {
      const response = await settingsService.getSettings();
      
      if (!response || !response.success) {
        showMessage(messagesContainer, "Aucun paramètre trouvé, valeurs par défaut utilisées.", 'info');
        return;
      }
      
      const settings = response.settings;
      loadSettingsIntoForm(settings);
      
      // Appliquer les styles immédiatement
      applyStylePreferences(settings);
      
    } catch (error) {
      console.error("Erreur de chargement des paramètres :", error);
      showMessage(messagesContainer, "Impossible de charger les paramètres.", 'error');
    }
  }
  
  function loadSettingsIntoForm(settings) {
    // Interface
    document.getElementById('theme-toggle').checked = settings.darkMode || false;
    document.getElementById('font-size').value = settings.fontSize || 'medium';
    
    // Sélectionner le thème
    const themeInput = document.querySelector(`input[name="theme"][value="${settings.theme || 'medicine'}"]`);
    if (themeInput) themeInput.checked = true;
    
    // Notifications
    if (settings.notifications) {
      document.getElementById('email-notifications').checked = settings.notifications.email !== false;
      document.getElementById('quiz-reminders').checked = settings.notifications.reminders !== false;
      document.getElementById('reminder-frequency').value = settings.notifications.frequency || 'weekly';
    }
    
    // Confidentialité
    if (settings.privacy) {
      document.getElementById('data-sharing').checked = settings.privacy.dataSharing !== false;
      document.getElementById('document-retention').value = settings.privacy.documentRetention || '7';
    }
    
    // Étude
    if (settings.study) {
      document.getElementById('learning-mode').value = settings.study.mode || 'random';
      document.getElementById('question-time').value = settings.study.timePerQuestion || '30';
      document.getElementById('daily-goal').value = settings.study.dailyGoal || 20;
    }
  }

  function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.settings-tab-content');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const targetId = `${button.dataset.tab}-tab`;
        contents.forEach(content => {
          content.style.display = content.id === targetId ? 'block' : 'none';
        });
      });
    });
    
    // Activer le premier onglet par défaut
    const firstTab = buttons[0];
    if (firstTab && !firstTab.classList.contains('active')) {
      firstTab.click();
    }
  }

  function setupSaveButton() {
    document.getElementById('save-settings-btn').addEventListener('click', async () => {
      try {
        const settings = {
          darkMode: document.getElementById('theme-toggle').checked,
          fontSize: document.getElementById('font-size').value,
          theme: document.querySelector('input[name="theme"]:checked')?.value || 'medicine',
          
          notifications: {
            email: document.getElementById('email-notifications').checked,
            reminders: document.getElementById('quiz-reminders').checked,
            frequency: document.getElementById('reminder-frequency').value
          },
          
          privacy: {
            dataSharing: document.getElementById('data-sharing').checked,
            documentRetention: parseInt(document.getElementById('document-retention').value)
          },
          
          study: {
            mode: document.getElementById('learning-mode').value,
            timePerQuestion: parseInt(document.getElementById('question-time').value),
            dailyGoal: parseInt(document.getElementById('daily-goal').value)
          },
          
          // Marquer comme venant de la page settings
          _fromSettingsPage: true
        };
        
        const response = await settingsService.updateSettings(settings);
        if (response && response.success) {
          showMessage(messagesContainer, 'Paramètres enregistrés avec succès', 'success');
        } else {
          throw new Error("Échec de la sauvegarde des paramètres");
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour :', error);
        showMessage(messagesContainer, "Impossible d'enregistrer les paramètres.", 'error');
      }
    });
  }

  function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      });
    }
  }

  function setupDeleteAccountButton() {
    const deleteButton = document.getElementById('delete-account-btn');
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
          try {
            // Implémenter la suppression de compte selon votre API
            showMessage(messagesContainer, 'Compte supprimé avec succès', 'success');
            setTimeout(() => {
              localStorage.clear();
              window.location.href = 'index.html';
            }, 2000);
          } catch (error) {
            console.error('Erreur:', error);
            showMessage(messagesContainer, 'Erreur lors de la suppression du compte', 'error');
          }
        }
      });
    }
  }
}

// Initialiser la page quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM chargé - Initialisation de settings-page");
  initSettingsPage().catch(err => {
    console.error("Erreur lors de l'initialisation de la page settings:", err);
  });
});
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
