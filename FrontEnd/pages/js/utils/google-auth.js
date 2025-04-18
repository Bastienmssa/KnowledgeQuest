// js/utils/google-auth.js
export class GoogleAuth {
  constructor(clientId) {
    this.clientId = clientId;
    this.isInitialized = false;
    this.googleUser = null;
    this.onSuccess = null;
    this.onFailure = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          try {
            google.accounts.id.initialize({
              client_id: this.clientId,
              callback: this.handleCredentialResponse.bind(this),
              auto_select: false,
              cancel_on_tap_outside: true
            });
            this.isInitialized = true;
            resolve(true);
          } catch (error) {
            console.error("Erreur d'initialisation Google Sign-In:", error);
            reject(error);
          }
        } else {
          reject(new Error("L'API Google n'a pas pu être chargée"));
        }
      };
      script.onerror = () => {
        reject(new Error("Erreur lors du chargement de l'API Google"));
      };
      document.head.appendChild(script);
    });
  }

  setCallbacks(onSuccess, onFailure) {
    this.onSuccess = onSuccess;
    this.onFailure = onFailure;
  }

  handleCredentialResponse(response) {
    if (response && response.credential) {
      try {
        const payload = this.parseJwt(response.credential);

        const user = {
          token: response.credential,
          user: {
            name: payload.name,
            email: payload.email,
            picture: payload.picture
          }
        };

        if (this.onSuccess) this.onSuccess(user);
      } catch (error) {
        console.error("Erreur de traitement de la réponse Google:", error);
        if (this.onFailure) this.onFailure(error);
      }
    } else if (this.onFailure) {
      this.onFailure(new Error("Réponse d'authentification invalide"));
    }
  }

  renderButton(elementId, options = {}) {
    if (!this.isInitialized || !window.google) {
      console.error("Google Auth non initialisé");
      return;
    }

    const defaultOptions = {
      type: 'standard',
      theme: 'filled_blue',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%'
    };

    const element = document.getElementById(elementId);
    if (element) {
      try {
        google.accounts.id.renderButton(element, { ...defaultOptions, ...options });
      } catch (error) {
        console.error("Erreur lors du rendu du bouton Google:", error);
      }
    }
  }

  promptOneTap() {
    if (this.isInitialized && window.google) {
      google.accounts.id.prompt();
    }
  }

  signOut() {
    if (window.google) {
      google.accounts.id.disableAutoSelect();
    }
  }

  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`
      ).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Erreur de parsing JWT:", error);
      throw new Error("Token JWT invalide");
    }
  }

  async loginWithKnowledgeQuest(googleResponse) {
    try {
      const { auth } = await import('./auth.js');
      return await auth.loginWithGoogle(googleResponse.credential);
    } catch (error) {
      console.error("Erreur de liaison Google -> Backend:", error);
      throw error;
    }
  }
}

export const googleAuthClient = new GoogleAuth(
  '485248682786-uqu5d30854o41npvr8l1l9paivmcgrc9.apps.googleusercontent.com'
);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await googleAuthClient.init();
    console.log('✅ Google Auth initialisé');
  } catch (error) {
    console.error('❌ Échec de l\'initialisation Google Auth:', error);
  }
});
