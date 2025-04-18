// js/utils/style.js

/**
 * Initialisation des styles dynamiques de l'application
 */
export function initStyles() {
  console.log("Initialisation des styles de l'application...");

  applySavedSettings();      // Applique les préférences utilisateur
  initThemeSwitcher();       // Écoute les changements de thème
  initFontSizeAdjuster();    // Écoute les changements de taille de texte
  applyDomainTheme();        // Applique le thème couleur selon le domaine
}

/**
 * Appliquer les préférences de style enregistrées (mode sombre, taille de police, etc.)
 */
function applySavedSettings() {
  const settings = JSON.parse(localStorage.getItem('userSettings')) || {};

  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  }

  if (settings.fontSize) {
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
  }

  if (settings.colorTheme) {
    setColorTheme(settings.colorTheme);
  }
}

/**
 * Appliquer le thème couleur (Médecine, Droit, Neutre)
 */
function setColorTheme(theme) {
  document.body.classList.remove('medicine-theme', 'law-theme', 'neutral-theme');

  if (theme === 'medicine') {
    document.body.classList.add('medicine-theme');
  } else if (theme === 'law') {
    document.body.classList.add('law-theme');
  } else if (theme === 'neutral') {
    document.body.classList.add('neutral-theme');
  }
}

/**
 * Appliquer automatiquement le thème selon le domaine de l'utilisateur (fallback)
 */
function applyDomainTheme() {
  const user = JSON.parse(localStorage.getItem('authData'))?.user;
  const settings = JSON.parse(localStorage.getItem('userSettings')) || {};

  // Si un thème couleur est défini dans les paramètres, il prime
  if (!settings.colorTheme && user?.domain) {
    if (user.domain === 'Médecine') {
      document.body.classList.add('medicine-theme');
    } else if (user.domain === 'Droit') {
      document.body.classList.add('law-theme');
    }
  }
}

/**
 * Écouteur pour les changements de thème (mode sombre)
 */
function initThemeSwitcher() {
  document.addEventListener('themeChanged', (e) => {
    if (e.detail.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  });
}

/**
 * Écouteur pour les changements de taille de police
 */
function initFontSizeAdjuster() {
  document.addEventListener('fontSizeChanged', (e) => {
    if (e.detail.fontSize) {
      document.documentElement.setAttribute('data-font-size', e.detail.fontSize);
    }
  });
}
