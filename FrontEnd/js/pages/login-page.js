// js/pages/login-page.js
/**
 * Gestionnaire pour la page de connexion
 */
import { auth } from '../utils/auth.js';
import { authService } from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';
import { googleAuthClient } from '../utils/google-auth.js';

export function initLoginPage() {
  console.log("Initialisation de la page de connexion...");
  
  // Vérifier si l'utilisateur est déjà connecté
  if (auth.isLoggedIn) {
    window.location.href = '../pages/dashboard.html';
    return;
  }
  
  // Initialiser les écouteurs d'événements
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleLogin(e.target);
    });
  }
  
  // Google Login Button
  const googleLoginBtn = document.getElementById('google-login');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
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
              showNotification('Erreur de connexion avec Google', 'error');
              console.error(error);
            }
          );
          
          window.googleAuthClient.promptOneTap();
        } else {
          showNotification('Service Google Auth non disponible', 'error');
        }
      } catch (error) {
        console.error('Erreur Google Auth:', error);
        showNotification('Erreur de connexion avec Google', 'error');
      }
    });
  }
}

async function handleLogin(form) {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Validation des champs
  if (!email || !password) {
    showNotification('Veuillez remplir tous les champs', 'error');
    return;
  }
  
  const submitButton = form.querySelector('button[type="submit"]');
  
  try {
    // Désactiver le bouton pendant la connexion
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Connexion en cours...';
    }
    
    // Connexion
    await authService.login(email, password);
    
    // Redirection en cas de succès
    showNotification('Connexion réussie! Redirection...', 'success');
    setTimeout(() => {
      window.location.href = '../pages/dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Erreur de connexion:', error);
    showNotification(error.message || 'Identifiants incorrects', 'error');
  } finally {
    // Réactiver le bouton
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Se connecter';
    }
  }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initLoginPage);