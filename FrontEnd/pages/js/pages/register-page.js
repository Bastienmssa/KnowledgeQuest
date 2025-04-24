import api from '../api/api.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
    return;
  }

  const registerBtn = document.getElementById('register-btn');
  const googleBtn = document.getElementById('google-register');

  // FORMULAIRE CLASSIQUE
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

  // INSCRIPTION GOOGLE
  googleBtn?.addEventListener("click", async () => {
    const domain = document.getElementById('register-domain').value;
    if (!domain) {
      return showNotification("Veuillez sélectionner un domaine", 'error');
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, domain })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("Inscription via Google réussie !", "success");
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
      } else {
        showNotification(data.message || "Erreur Google", "error");
      }
    } catch (err) {
      console.error("Erreur Google :", err);
      showNotification("Échec de la connexion Google", "error");
    }
  });
});

// FONCTION UTILITAIRE
function showNotification(msg, type) {
  const msgBox = document.querySelector('.auth-messages');
  if (msgBox) {
    msgBox.innerHTML = `<div class="notification ${type}">${msg}</div>`;
    setTimeout(() => msgBox.innerHTML = '', 5000);
  } else {
    alert(msg);
  }
}

// CONFIGURATION FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD_VQ1JVFRE-CmBwGEUWxHXiZ8sF7PH1FM",
  authDomain: "knowledgequestauth.firebaseapp.com",
  projectId: "knowledgequestauth",
  storageBucket: "knowledgequestauth.firebasestorage.app",
  messagingSenderId: "320465505876",
  appId: "1:320465505876:web:7d047904254de893f427c1",
  measurementId: "G-BPZQY7YDL4"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
