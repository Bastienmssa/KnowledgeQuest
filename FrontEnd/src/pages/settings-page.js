/**
 * Gestionnaire pour la page des paramètres
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';

// Initialiser la page des paramètres
export function initSettingsPage() {
    console.log("Initializing settings page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialiser les paramètres d'affichage
    initDisplaySettings();
    
    // Initialiser les paramètres de notification
    initNotificationSettings();
    
    // Initialiser les paramètres de confidentialité
    initPrivacySettings();
    
    // Initialiser les options de compte
    initAccountOptions();
}

// Initialiser les paramètres d'affichage
function initDisplaySettings() {
    const themeToggle = document.getElementById('theme-toggle');
    const fontSizeSelect = document.getElementById('font-size');
    
    // Récupérer les paramètres stockés
    const userSettings = getUserSettings();
    
    // Initialiser le toggle du thème
    if (themeToggle) {
        // Définir l'état initial
        themeToggle.checked = userSettings.darkMode;
        
        // Mettre à jour le thème si nécessaire
        if (userSettings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Ajouter l'écouteur d'événement
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            
            // Enregistrer le paramètre
            userSettings.darkMode = themeToggle.checked;
            saveUserSettings(userSettings);
        });
    }
    
    // Initialiser la sélection de taille de police
    if (fontSizeSelect) {
        // Définir la valeur initiale
        fontSizeSelect.value = userSettings.fontSize || 'medium';
        
        // Appliquer la taille de police
        applyFontSize(userSettings.fontSize || 'medium');
        
        // Ajouter l'écouteur d'événement
        fontSizeSelect.addEventListener('change', () => {
            const fontSize = fontSizeSelect.value;
            applyFontSize(fontSize);
            
            // Enregistrer le paramètre
            userSettings.fontSize = fontSize;
            saveUserSettings(userSettings);
        });
    }
}

// Appliquer la taille de police
function applyFontSize(size) {
    const htmlElement = document.documentElement;
    
    // Supprimer les classes existantes
    htmlElement.classList.remove('font-small', 'font-medium', 'font-large');
    
    // Ajouter la nouvelle classe
    htmlElement.classList.add(`font-${size}`);
}

// Initialiser les paramètres de notification
function initNotificationSettings() {
    const emailNotificationsToggle = document.getElementById('email-notifications');
    const quizRemindersToggle = document.getElementById('quiz-reminders');
    
    // Récupérer les paramètres stockés
    const userSettings = getUserSettings();
    
    // Initialiser les toggles
    if (emailNotificationsToggle) {
        emailNotificationsToggle.checked = userSettings.emailNotifications !== false;
        
        emailNotificationsToggle.addEventListener('change', async () => {
            try {
                const response = await window.KnowledgeQuestAPI.updateNotificationSettings({
                    emailNotifications: emailNotificationsToggle.checked
                });
                
                if (response.success) {
                    // Enregistrer le paramètre
                    userSettings.emailNotifications = emailNotificationsToggle.checked;
                    saveUserSettings(userSettings);
                    
                    showMessage(document.querySelector('.settings-messages'), 'Paramètres de notification mis à jour', 'success');
                } else {
                    showMessage(document.querySelector('.settings-messages'), response.message || 'Erreur lors de la mise à jour des paramètres', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage(document.querySelector('.settings-messages'), 'Erreur lors de la mise à jour des paramètres', 'error');
            }
        });
    }
    
    if (quizRemindersToggle) {
        quizRemindersToggle.checked = userSettings.quizReminders !== false;
        
        quizRemindersToggle.addEventListener('change', async () => {
            try {
                const response = await window.KnowledgeQuestAPI.updateNotificationSettings({
                    quizReminders: quizRemindersToggle.checked
                });
                
                if (response.success) {
                    // Enregistrer le paramètre
                    userSettings.quizReminders = quizRemindersToggle.checked;
                    saveUserSettings(userSettings);
                    
                    showMessage(document.querySelector('.settings-messages'), 'Paramètres de notification mis à jour', 'success');
                } else {
                    showMessage(document.querySelector('.settings-messages'), response.message || 'Erreur lors de la mise à jour des paramètres', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage(document.querySelector('.settings-messages'), 'Erreur lors de la mise à jour des paramètres', 'error');
            }
        });
    }
}

// Initialiser les paramètres de confidentialité
function initPrivacySettings() {
    const dataSharingToggle = document.getElementById('data-sharing');
    
    // Récupérer les paramètres stockés
    const userSettings = getUserSettings();
    
    // Initialiser le toggle
    if (dataSharingToggle) {
        dataSharingToggle.checked = userSettings.dataSharing !== false;
        
        dataSharingToggle.addEventListener('change', async () => {
            try {
                const response = await window.KnowledgeQuestAPI.updatePrivacySettings({
                    dataSharing: dataSharingToggle.checked
                });
                
                if (response.success) {
                    // Enregistrer le paramètre
                    userSettings.dataSharing = dataSharingToggle.checked;
                    saveUserSettings(userSettings);
                    
                    showMessage(document.querySelector('.settings-messages'), 'Paramètres de confidentialité mis à jour', 'success');
                } else {
                    showMessage(document.querySelector('.settings-messages'), response.message || 'Erreur lors de la mise à jour des paramètres', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage(document.querySelector('.settings-messages'), 'Erreur lors de la mise à jour des paramètres', 'error');
            }
        });
    }
}

// Initialiser les options de compte
function initAccountOptions() {
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    
    // Bouton de suppression de compte
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
                deleteUserAccount();
            }
        });
    }
    
    // Bouton d'exportation des données
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            exportUserData();
        });
    }
    
    // Supprimer le compte utilisateur
    async function deleteUserAccount() {
        try {
            const response = await window.KnowledgeQuestAPI.deleteAccount();
            
            if (response.success) {
                // Déconnecter l'utilisateur
                auth.logout();
                
                // Rediriger vers la page d'accueil
                window.location.href = 'index.html?deleted=true';
            } else {
                showMessage(document.querySelector('.settings-messages'), response.message || 'Erreur lors de la suppression du compte', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showMessage(document.querySelector('.settings-messages'), 'Erreur lors de la suppression du compte', 'error');
        }
    }
    
    // Exporter les données de l'utilisateur
    async function exportUserData() {
        try {
            showMessage(document.querySelector('.settings-messages'), 'Préparation de vos données...', 'info');
            
            const response = await window.KnowledgeQuestAPI.exportUserData();
            
            if (response.success && response.data) {
                // Créer un fichier de téléchargement
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const dataUrl = URL.createObjectURL(dataBlob);
                
                // Créer un lien de téléchargement
                const downloadLink = document.createElement('a');
                downloadLink.href = dataUrl;
                downloadLink.download = 'knowledge_quest_data.json';
                
                // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                showMessage(document.querySelector('.settings-messages'), 'Téléchargement des données terminé', 'success');
            } else {
                showMessage(document.querySelector('.settings-messages'), response.message || 'Erreur lors de l\'exportation des données', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showMessage(document.querySelector('.settings-messages'), 'Erreur lors de l\'exportation des données', 'error');
        }
    }
}

// Récupérer les paramètres de l'utilisateur
function getUserSettings() {
    const storedSettings = localStorage.getItem('userSettings');
    
    if (storedSettings) {
        return JSON.parse(storedSettings);
    }
    
    // Paramètres par défaut
    return {
        darkMode: false,
        fontSize: 'medium',
        emailNotifications: true,
        quizReminders: true,
        dataSharing: true
    };
}

// Enregistrer les paramètres de l'utilisateur
function saveUserSettings(settings) {
    localStorage.setItem('userSettings', JSON.stringify(settings));
}