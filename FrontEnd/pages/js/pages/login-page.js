// js/pages/login-page.js
import api from '../api/api.js';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return showNotification('Tous les champs sont requis', 'error');

    const btn = loginForm.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner');
    btn.disabled = true;
    spinner?.classList.add('active');

    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      showNotification('Connexion réussie !', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } catch (err) {
      showNotification(err.message || 'Erreur de connexion', 'error');
    } finally {
      btn.disabled = false;
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
}
