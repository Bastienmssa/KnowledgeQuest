// pages/js/pages/login-page.js
import auth from '../utils/auth.js';
import authService from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';

let pageInitialized = false;

export function initLoginPage() {
  if (pageInitialized) {
    console.log('🔄 Page login déjà initialisée');
    return;
  }
  
  console.log('🔑 Initialisation page login');

  // Rediriger si déjà connecté
  if (auth.isLoggedIn) {
    auth.redirectIfAuthenticated();
    return;
  }

  const form = document.getElementById('login-form');
  if (!form) {
    console.error('❌ Formulaire de login introuvable');
    return;
  }

  // Supprimer les écouteurs existants
  form.removeEventListener('submit', handleLoginSubmit);
  
  // Ajouter le nouvel écouteur
  form.addEventListener('submit', handleLoginSubmit);
  
  pageInitialized = true;
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form['email'].value.trim();
  const password = form['password'].value;

  if (!email || !password) {
    return showNotification('Veuillez remplir tous les champs.', 'error');
  }

  const btn = document.getElementById('login-btn');
  if (btn) {
    btn.disabled = true;
    const spinner = btn.querySelector('.spinner');
    if (spinner) spinner.classList.add('active');
  }

  try {
    await authService.login({ email, password });
    showNotification('Connexion réussie !', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  } catch (err) {
    console.error('❌ Erreur connexion:', err);
    showNotification(err.message || 'Erreur de connexion', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      const spinner = btn.querySelector('.spinner');
      if (spinner) spinner.classList.remove('active');
    }
  }
}