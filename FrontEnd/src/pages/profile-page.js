/**
 * Gestionnaire pour la page de profil utilisateur
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';

// Initialiser la page de profil
export function initProfilePage() {
    console.log("Initializing profile page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Charger les informations du profil
    loadProfileInfo();
    
    // Initialiser les onglets
    initProfileTabs();
    
    // Initialiser les formulaires de mise à jour
    initProfileForms();
}

// Charger les informations du profil
function loadProfileInfo() {
    const profileContainer = document.querySelector('.profile-info');
    if (!profileContainer || !auth.user) return;
    
    // Nom et prénom
    const nameElement = document.getElementById('profile-name');
    if (nameElement) {
        nameElement.textContent = `${auth.user.firstName} ${auth.user.lastName}`;
    }
    
    // Email
    const emailElement = document.getElementById('profile-email');
    if (emailElement) {
        emailElement.textContent = auth.user.email;
    }
    
    // Domaine
    const domainElement = document.getElementById('profile-domain');
    if (domainElement) {
        domainElement.textContent = auth.user.domain || 'Non spécifié';
    }
    
    // Date d'inscription
    const joinDateElement = document.getElementById('profile-join-date');
    if (joinDateElement && auth.user.createdAt) {
        const joinDate = new Date(auth.user.createdAt);
        joinDateElement.textContent = `Membre depuis ${joinDate.toLocaleDateString()}`;
    }
    
    // Avatar/Initiales
    const avatarElement = document.getElementById('profile-avatar');
    if (avatarElement) {
        if (auth.user.avatarUrl) {
            avatarElement.innerHTML = `<img src="${auth.user.avatarUrl}" alt="Avatar">`;
        } else {
            // Générer des initiales
            const initials = `${auth.user.firstName.charAt(0)}${auth.user.lastName.charAt(0)}`;
            avatarElement.innerHTML = `<div class="initials-avatar">${initials}</div>`;
        }
    }
}

// Initialiser les onglets du profil
function initProfileTabs() {
    const tabButtons = document.querySelectorAll('.profile-tab-btn');
    if (!tabButtons.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Activer l'onglet cliqué
            button.classList.add('active');
            
            // Afficher le contenu correspondant
            const tabId = button.getAttribute('data-tab');
            
            document.querySelectorAll('.profile-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            const tabContent = document.getElementById(`${tabId}-content`);
            if (tabContent) {
                tabContent.style.display = 'block';
            }
        });
    });
    
    // Activer le premier onglet par défaut
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

// Initialiser les formulaires de profil
function initProfileForms() {
    // Formulaire de mise à jour des informations personnelles
    const personalInfoForm = document.getElementById('personal-info-form');
    if (personalInfoForm) {
        // Pré-remplir le formulaire
        if (auth.user) {
            const firstNameInput = document.getElementById('profile-firstname');
            const lastNameInput = document.getElementById('profile-lastname');
            const emailInput = document.getElementById('profile-email-input');
            const domainInput = document.getElementById('profile-domain-input');
            
            if (firstNameInput) firstNameInput.value = auth.user.firstName || '';
            if (lastNameInput) lastNameInput.value = auth.user.lastName || '';
            if (emailInput) emailInput.value = auth.user.email || '';
            if (domainInput) domainInput.value = auth.user.domain || '';
        }
        
        // Gérer la soumission du formulaire
        personalInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                firstName: document.getElementById('profile-firstname').value,
                lastName: document.getElementById('profile-lastname').value,
                email: document.getElementById('profile-email-input').value,
                domain: document.getElementById('profile-domain-input').value
            };
            
            try {
                const response = await window.KnowledgeQuestAPI.updateUserProfile(userData);
                
                if (response.success) {
                    // Mettre à jour les informations locales
                    auth.user = {...auth.user, ...userData};
                    
                    // Afficher un message de succès
                    showMessage(document.querySelector('.profile-messages'), 'Profil mis à jour avec succès!', 'success');
                    
                    // Recharger les informations du profil
                    loadProfileInfo();
                } else {
                    showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur lors de la mise à jour du profil', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage(document.querySelector('.profile-messages'), 'Une erreur est survenue lors de la mise à jour du profil', 'error');
            }
        });
    }
    
    // Formulaire de changement de mot de passe
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Vérifier que les mots de passe correspondent
            if (newPassword !== confirmPassword) {
                showMessage(document.querySelector('.profile-messages'), 'Les mots de passe ne correspondent pas', 'error');
                return;
            }
            
            try {
                const response = await window.KnowledgeQuestAPI.updatePassword(currentPassword, newPassword);
                
                if (response.success) {
                    showMessage(document.querySelector('.profile-messages'), 'Mot de passe mis à jour avec succès!', 'success');
                    
                    // Réinitialiser le formulaire
                    passwordForm.reset();
                } else {
                    showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur lors de la mise à jour du mot de passe', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage(document.querySelector('.profile-messages'), 'Une erreur est survenue lors de la mise à jour du mot de passe', 'error');
            }
        });
    }
    
    // Gestion de l'upload d'avatar
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarInput = document.getElementById('avatar-input');
    
    if (avatarUpload && avatarInput) {
        avatarUpload.addEventListener('click', () => {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', async () => {
            if (avatarInput.files.length > 0) {
                const file = avatarInput.files[0];
                
                // Vérifier le type de fichier
                if (!file.type.startsWith('image/')) {
                    showMessage(document.querySelector('.profile-messages'), 'Veuillez sélectionner une image', 'error');
                    return;
                }
                
                // Envoyer l'avatar
                try {
                    const formData = new FormData();
                    formData.append('avatar', file);
                    
                    const response = await window.KnowledgeQuestAPI.uploadAvatar(formData);
                    
                    if (response.success) {
                        // Mettre à jour l'avatar local
                        auth.user.avatarUrl = response.avatarUrl;
                        
                        // Recharger les informations du profil
                        loadProfileInfo();
                        
                        showMessage(document.querySelector('.profile-messages'), 'Avatar mis à jour avec succès!', 'success');
                    } else {
                        showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur lors de la mise à jour de l\'avatar', 'error');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    showMessage(document.querySelector('.profile-messages'), 'Une erreur est survenue lors de la mise à jour de l\'avatar', 'error');
                }
            }
        });
    }
}