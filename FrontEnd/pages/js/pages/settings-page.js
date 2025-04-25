<<<<<<< HEAD
<<<<<<< HEAD
/**
 * Gestionnaire pour la page de paramètres
 */
import { auth } from '../utils/auth.js';
import { showMessage } from '../components/component.js';
=======
// pages/settings-page.js
>>>>>>> AuthGoogle
import { settingsService } from '../services/settings-service.js';
import { showNotification } from '../components/notification.js';
import { applyStylePreferences } from '../utils/style.js';

export async function initSettingsPage() {
  console.log("Initialisation de la page de paramètres...");

  const messagesContainer = document.querySelector('.settings-messages');

  function showMessage(container, message, type = 'info') {
    if (!container) return;
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    container.innerHTML = '';
    container.appendChild(messageEl);
    showNotification(message, type);
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

  window.addEventListener('settings-updated', (e) => {
    console.log("Mise à jour des paramètres reçue :", e.detail);
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

      loadSettingsIntoForm(response.settings);
      applyStylePreferences(response.settings);
    } catch (err) {
      console.error("Erreur chargement settings :", err);
      showMessage(messagesContainer, "Erreur chargement paramètres", 'error');
    }
  }

  function loadSettingsIntoForm(settings) {
    // Interface
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.checked = settings.darkMode || false;

    const fontSize = document.getElementById('font-size');
    if (fontSize) fontSize.value = settings.fontSize || 'medium';

    const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme || 'medicine'}"]`);
    if (themeRadio) themeRadio.checked = true;

    // Notifications
    if (settings.notifications) {
      const emailNotif = document.getElementById('email-notifications');
      if (emailNotif) emailNotif.checked = settings.notifications.email !== false;

      const quizReminders = document.getElementById('quiz-reminders');
      if (quizReminders) quizReminders.checked = settings.notifications.reminders !== false;

      const freq = document.getElementById('reminder-frequency');
      if (freq) freq.value = settings.notifications.frequency || 'weekly';
    }

    // Confidentialité
    if (settings.privacy) {
      const dataSharing = document.getElementById('data-sharing');
      if (dataSharing) dataSharing.checked = settings.privacy.dataSharing !== false;

      const docRetention = document.getElementById('document-retention');
      if (docRetention) docRetention.value = settings.privacy.documentRetention || '7';
    }

    // Étude
    if (settings.study) {
      const mode = document.getElementById('learning-mode');
      if (mode) mode.value = settings.study.mode || 'random';

      const time = document.getElementById('question-time');
      if (time) time.value = settings.study.timePerQuestion || '30';

      const goal = document.getElementById('daily-goal');
      if (goal) goal.value = settings.study.dailyGoal || 20;
    }
  }

  function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.settings-tab-content');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        const targetId = `${button.dataset.tab}-tab`;
        contents.forEach(content => {
          content.style.display = content.id === targetId ? 'block' : 'none';
        });
      });
    });

    if (buttons[0]) buttons[0].click();
  }

  function setupSaveButton() {
    const saveBtn = document.getElementById('save-settings-btn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
      try {
        const settings = {
          darkMode: document.getElementById('theme-toggle')?.checked || false,
          fontSize: document.getElementById('font-size')?.value || 'medium',
          theme: document.querySelector('input[name="theme"]:checked')?.value || 'medicine',

          notifications: {
            email: document.getElementById('email-notifications')?.checked || false,
            reminders: document.getElementById('quiz-reminders')?.checked || false,
            frequency: document.getElementById('reminder-frequency')?.value || 'weekly'
          },

          privacy: {
            dataSharing: document.getElementById('data-sharing')?.checked || false,
            documentRetention: parseInt(document.getElementById('document-retention')?.value || '7')
          },

          study: {
            mode: document.getElementById('learning-mode')?.value || 'random',
            timePerQuestion: parseInt(document.getElementById('question-time')?.value || '30'),
            dailyGoal: parseInt(document.getElementById('daily-goal')?.value || '20')
          },

          _fromSettingsPage: true
        };

        const res = await settingsService.updateSettings(settings);
        if (res.success) {
          showMessage(messagesContainer, "✅ Paramètres enregistrés", 'success');
        } else {
          showMessage(messagesContainer, "❌ Sauvegarde échouée", 'error');
        }
      } catch (error) {
        console.error("Erreur save settings:", error);
        showMessage(messagesContainer, "Erreur serveur lors de l'enregistrement", 'error');
      }
    });
  }

  function setupLogoutButton() {
    const btn = document.getElementById('logout-button');
    if (btn) {
      btn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
      });
    }
  }

  function setupDeleteAccountButton() {
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm("Voulez-vous vraiment supprimer votre compte ?")) {
          // TODO: Suppression serveur si dispo
          localStorage.clear();
          showNotification("Compte supprimé", "success");
          setTimeout(() => window.location.href = 'index.html', 1500);
        }
      });
    }
  }
}

<<<<<<< HEAD
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
=======
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM prêt - initSettingsPage");
  initSettingsPage().catch(console.error);
});
>>>>>>> AuthGoogle
