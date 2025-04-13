// js/pages/register-page.js
/**
 * Gestionnaire pour la page d'inscription
 */
import { auth } from '../utils/auth.js';
import { authService } from '../services/auth-service.js';
import { subjectService } from '../services/subject-service.js';
import { showNotification } from '../components/notification.js';
import { googleAuthClient } from '../utils/google-auth.js';

export function initRegisterPage() {
  console.log("Initialisation de la page d'inscription...");
  
  // Vérifier si l'utilisateur est déjà connecté
  if (auth.isLoggedIn) {
    window.location.href = '../pages/dashboard.html';
    return;
  }
  
  // Charger les domaines d'étude
  loadDomains();
  
  // Initialiser les écouteurs d'événements
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleRegistration(e.target);
    });
  }
  
  // Google Register Button
  const googleRegisterBtn = document.getElementById('google-register');
  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener('click', async () => {
      try {
        // Initialiser Google Auth si nécessaire
        if (window.googleAuthClient) {
          window.googleAuthClient.setCallbacks(
            async (response) => {
              try {
                await authService.loginWithGoogle(response.credential);
                window.location.href = '../pages/dashboard.html';
              } catch (error) {
                showNotification(error.message, 'error');
              }
            },
            (error) => {
              showNotification('Erreur d\'inscription avec Google', 'error');
              console.error(error);
            }
          );
          
          window.googleAuthClient.promptOneTap();
        } else {
          showNotification('Service Google Auth non disponible', 'error');
        }
      } catch (error) {
        console.error('Erreur Google Auth:', error);
        showNotification('Erreur d\'inscription avec Google', 'error');
      }
    });
  }
}

async function loadDomains() {
  const domainSelect = document.getElementById('register-domain');
  if (!domainSelect) return;
  
  try {
    const subjects = await subjectService.getAllSubjects();
    
    if (subjects && subjects.length > 0) {
      // Conserver l'option par défaut
      const defaultOption = domainSelect.innerHTML;
      
      // Générer les options
      let options = defaultOption;
      subjects.forEach(subject => {
        options += `<option value="${subject.name}">${subject.name}</option>`;
      });
      
      domainSelect.innerHTML = options;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des domaines:', error);
    
    // Ajouter des domaines par défaut en cas d'erreur
    const defaultDomains = [
      { value: 'Médecine', label: 'Médecine' },
      { value: 'Droit', label: 'Droit' }
    ];
    
    defaultDomains.forEach(domain => {
      const option = document.createElement('option');
      option.value = domain.value;
      option.textContent = domain.label;
      domainSelect.appendChild(option);
    });
  }
}

async function handleRegistration(form) {
  const firstName = document.getElementById('register-firstname').value;
  const lastName = document.getElementById('register-lastname').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password')?.value;
  const domain = document.getElementById('register-domain').value;
  const termsCheckbox = document.getElementById('terms');
  
  // Validation des champs
  if (!firstName || !lastName || !email || !password || !domain) {
    showNotification('Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }
  
  if (confirmPassword && password !== confirmPassword) {
    showNotification('Les mots de passe ne correspondent pas', 'error');
    return;
  }
  
  if (termsCheckbox && !termsCheckbox.checked) {
    showNotification('Vous devez accepter les conditions d\'utilisation', 'error');
    return;
  }
  
  const submitButton = form.querySelector('button[type="submit"]');
  
  try {
    // Désactiver le bouton pendant l'inscription
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Création du compte...';
    }
    
    // Inscription
    const userData = {
      name: `${firstName} ${lastName}`,
      email,
      password,
      domain
    };
    
    await authService.register(userData);
    
    // Redirection en cas de succès
    showNotification('Compte créé avec succès! Redirection...', 'success');
    setTimeout(() => {
      window.location.href = '../pages/dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    showNotification(error.message || 'Erreur d\'inscription', 'error');
  } finally {
    // Réactiver le bouton
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Créer un compte';
    }
  }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initRegisterPage);