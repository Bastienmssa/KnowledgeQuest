/*
Contient les fichiers CSS ou SCSS pour le style de l'application. Cela peut inclure des fichiers comme main.css, theme.css, etc.
Les styles peuvent être organisés par composant, par page, ou de manière globale.
*/

// style.js - Gestionnaire des styles de l'application
export function initStyles() {
    console.log("Initializing application styles...");
    
    // Appliquer le thème approprié basé sur le domaine de l'utilisateur
    applyDomainTheme();
    
    // Initialiser le theme switcher (clair/sombre)
    initThemeSwitcher();
  }
  
  // Appliquer le thème approprié au domaine de l'utilisateur
  function applyDomainTheme() {
    const user = JSON.parse(localStorage.getItem('authData'))?.user;
    
    if (user && user.domain) {
      // Appliquer un thème différent selon le domaine (Médecine ou Droit)
      if (user.domain === 'Médecine') {
        document.body.classList.add('medicine-theme');
        document.body.classList.remove('law-theme');
      } else if (user.domain === 'Droit') {
        document.body.classList.add('law-theme');
        document.body.classList.remove('medicine-theme');
      }
    }
  }
  
  // Initialiser le thème clair/sombre
  function initThemeSwitcher() {
    // Vérifier les préférences utilisateur sauvegardées
    const userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
    
    // Appliquer le mode sombre si préféré
    if (userSettings.darkMode) {
      document.body.classList.add('dark-mode');
    }
    
    // Écouter les changements du sélecteur de thème dans les paramètres
    document.addEventListener('themeChanged', (e) => {
      if (e.detail.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    });
  }