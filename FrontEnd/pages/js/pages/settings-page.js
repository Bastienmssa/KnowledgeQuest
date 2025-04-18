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
