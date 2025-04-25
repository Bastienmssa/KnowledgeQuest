// pages/js/pages/register-page.js

import auth from '../utils/auth.js';
import authService from '../services/auth-service.js';
import { showNotification } from '../components/notification.js';
import { signInWithGooglePopup } from '../utils/firebase-auth.js';

export function initRegisterPage() {
  console.log('✍️ initRegisterPage()');

  if (auth.isLoggedIn) {
    auth.redirectIfAuthenticated();
    return;
  }

  const form = document.getElementById('register-form');
  const googleBtn = document.getElementById('google-register');

  // 👉 Gestion du formulaire classique
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const fn = form['register-firstname'].value.trim();
      const ln = form['register-lastname'].value.trim();
      const email = form['register-email'].value.trim();
      const pwd = form['register-password'].value;
      const confirm = form['register-confirm-password'].value;
      const domain = form['register-domain'].value;
      const terms = form['terms'].checked;

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

  // 👉 Connexion Google avec Firebase
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        console.log("🔁 Tentative d'authentification Google...");
        const { token, user } = await signInWithGooglePopup();

        console.log("✅ Utilisateur Google connecté :", user);
        console.log("🧩 Token Firebase récupéré :", token);

        const domain = document.getElementById('register-domain')?.value || "Médecine";
        console.log("🎓 Domaine sélectionné :", domain);

        const res = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, domain })
        });

        const data = await res.json();

        console.log("🔄 Réponse serveur :", data);

        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "dashboard.html";
        } else {
          showNotification(data.message || "Échec de l'authentification Google", "error");
        }
      } catch (err) {
        console.error("❌ Erreur Google Firebase:", err);
        showNotification("Erreur de connexion avec Google", "error");
      }
    });
  }
}
