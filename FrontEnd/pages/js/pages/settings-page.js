// pages/settings-page.js
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

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM prêt - initSettingsPage");
  initSettingsPage().catch(console.error);
});
