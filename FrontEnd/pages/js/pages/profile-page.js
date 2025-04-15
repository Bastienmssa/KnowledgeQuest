/**
 * Gestionnaire pour la page de profil
 */
import { auth } from '../utils/auth.js';
import { KnowledgeQuestAPI } from '../api/api.js';
import { showMessage } from '../components/component.js';

export function initProfilePage() {
  console.log("Initialisation de la page de profil...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialiser le profil
  displayUserProfile();
  setupProfileForms();
  initProfileTabs();
}

function displayUserProfile() {
  if (!auth.user) return;
  
  // Afficher les informations de base du profil
  const profileHeader = document.querySelector('.profile-header');
  if (profileHeader) {
    profileHeader.innerHTML = `
      <div class="profile-avatar">
        <div class="avatar-placeholder">${getInitials(auth.user.name)}</div>
      </div>
      <div class="profile-info">
        <h2>${auth.user.name}</h2>
        <p>${auth.user.email}</p>
        <div class="domain-badge ${auth.user.domain === 'Médecine' ? 'medicine' : 'law'}">${auth.user.domain}</div>
      </div>
    `;
  }
  
  // Pré-remplir le formulaire de profil
  document.getElementById('profile-name')?.setAttribute('value', auth.user.name || '');
  document.getElementById('profile-email')?.setAttribute('value', auth.user.email || '');
  
  const domainSelect = document.getElementById('profile-domain');
  if (domainSelect) {
    Array.from(domainSelect.options).forEach(option => {
      if (option.value === auth.user.domain) {
        option.selected = true;
      }
    });
  }
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
}

function setupProfileForms() {
  // Formulaire de mise à jour du profil
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const userData = {
          name: document.getElementById('profile-name').value,
          email: document.getElementById('profile-email').value,
          domain: document.getElementById('profile-domain').value
        };
        
        // Mettre à jour le profil
        const response = await KnowledgeQuestAPI.user.updateProfile(userData);
        
        if (response.success) {
          // Mettre à jour les données utilisateur stockées localement
          auth.user = { ...auth.user, ...userData };
          localStorage.setItem('user', JSON.stringify(auth.user));
          
          // Afficher un message de succès
          showMessage(document.querySelector('.profile-messages'), 'Profil mis à jour avec succès', 'success');
          
          // Mettre à jour l'affichage
          displayUserProfile();
        } else {
          showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur lors de la mise à jour du profil', 'error');
        }
      } catch (error) {
        console.error('Erreur:', error);
        showMessage(document.querySelector('.profile-messages'), 'Erreur lors de la mise à jour du profil', 'error');
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
      
      if (newPassword !== confirmPassword) {
        showMessage(document.querySelector('.profile-messages'), 'Les mots de passe ne correspondent pas', 'error');
        return;
      }
      
      try {
        // Mettre à jour le mot de passe
        const response = await KnowledgeQuestAPI.user.updatePassword(currentPassword, newPassword);
        
        if (response.success) {
          showMessage(document.querySelector('.profile-messages'), 'Mot de passe mis à jour avec succès', 'success');
          passwordForm.reset();
        } else {
          showMessage(document.querySelector('.profile-messages'), response.message || 'Erreur lors de la mise à jour du mot de passe', 'error');
        }
      } catch (error) {
        console.error('Erreur:', error);
        showMessage(document.querySelector('.profile-messages'), 'Erreur lors de la mise à jour du mot de passe', 'error');
      }
    });
  }
}

function initProfileTabs() {
  const tabButtons = document.querySelectorAll('.profile-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Supprimer la classe active de tous les onglets
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.style.display = 'none');
      
      // Activer l'onglet cliqué
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId)?.style.display = 'block';
    });
  });
  
  // Activer le premier onglet par défaut
  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initProfilePage);