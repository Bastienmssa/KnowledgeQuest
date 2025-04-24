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
}
