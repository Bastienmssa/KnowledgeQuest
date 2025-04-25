<<<<<<< HEAD
// js/pages/register-page.js
import api from '../api/api.js';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
    return;
  }

  const registerBtn = document.getElementById('register-btn');
  registerBtn?.addEventListener('click', async () => {
    const firstName = document.getElementById('register-firstname').value.trim();
    const lastName = document.getElementById('register-lastname').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const domain = document.getElementById('register-domain').value;
    const terms = document.getElementById('terms').checked;

    if (!firstName || !lastName || !email || !password || !domain)
      return showNotification('Champs requis manquants', 'error');

    if (password !== confirmPassword)
      return showNotification('Les mots de passe ne correspondent pas', 'error');

    if (!terms)
      return showNotification('Veuillez accepter les conditions', 'error');

    const userData = {
      name: `${firstName} ${lastName}`,
      email,
      password,
      domain
    };

    const spinner = registerBtn.querySelector('.spinner');
    registerBtn.disabled = true;
    spinner?.classList.add('active');

    try {
      const res = await api.auth.register(userData);
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        showNotification('Inscription réussie !', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
      } else {
        setTimeout(() => window.location.href = 'login.html', 1500);
      }
    } catch (err) {
      showNotification(err.message || 'Erreur serveur', 'error');
    } finally {
      registerBtn.disabled = false;
      spinner?.classList.remove('active');
    }
  });
});

function showNotification(msg, type) {
  const msgBox = document.querySelector('.auth-messages');
  if (msgBox) {
    msgBox.innerHTML = `<div class="notification ${type}">${msg}</div>`;
    setTimeout(() => msgBox.innerHTML = '', 5000);
  } else {
    alert(msg);
  }
=======
// pages/js/pages/register-page.js
import auth from '../utils/auth.js';
import authService from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';

export function initRegisterPage() {
  console.log('✍️ initRegisterPage()');

  // Même redirection si déjà connecté
  if (auth.isLoggedIn) {
    auth.redirectIfAuthenticated();
    return;
  }

  const form = document.getElementById('register-form');
  if (!form) {
    console.error('❌ Formulaire d\'inscription introuvable');
    return;
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fn     = form['register-firstname'].value.trim();
    const ln     = form['register-lastname'].value.trim();
    const email  = form['register-email'].value.trim();
    const pwd    = form['register-password'].value;
    const confirm= form['register-confirm-password'].value;
    const domain = form['register-domain'].value;
    const terms  = form['terms'].checked;

    if (!fn || !ln || !email || !pwd || !domain) {
      return showNotification('Tous les champs sont requis.', 'error');
    }
    if (pwd !== confirm) {
      return showNotification('Les mots de passe ne correspondent pas.', 'error');
    }
    if (!terms) {
      return showNotification('Veuillez accepter les conditions.', 'error');
    }

    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.querySelector('.spinner')?.classList.add('active');

    try {
      await authService.register({
        name: `${fn} ${ln}`,
        email,
        password: pwd,
        domain
      });
      showNotification('Inscription réussie !', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 800);
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Erreur d\'inscription', 'error');
    } finally {
      btn.disabled = false;
      btn.querySelector('.spinner')?.classList.remove('active');
    }
  };
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
}
