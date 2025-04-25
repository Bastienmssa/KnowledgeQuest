<<<<<<< HEAD
<<<<<<< HEAD
// js/utils/style.js
=======
// style.js - Gestion des thèmes et préférences
let stylesApplied = false;
>>>>>>> AuthGoogle

export function initStyles() {
  if (stylesApplied) {
    console.log("Styles déjà initialisés, skip.");
    return;
  }
  console.log("⚙️ Initialisation des styles...");
  applySavedSettings();
  setupStyleEventListeners();
  stylesApplied = true;
}

function applySavedSettings() {
  try {
    const raw = localStorage.getItem('userSettings');
    if (!raw) return;
    const settings = JSON.parse(raw);
    applyStylePreferences(settings);
  } catch (e) {
    console.error("Erreur appli style:", e);
  }
}

function setColorTheme(theme) {
  document.body.classList.remove('medicine-theme','law-theme','neutral-theme');
  if (theme==='medicine') document.body.classList.add('medicine-theme');
  else if (theme==='law') document.body.classList.add('law-theme');
  else if (theme==='neutral') document.body.classList.add('neutral-theme');
}

function applyDomainTheme() {
  try {
    const user = JSON.parse(localStorage.getItem('authData'))?.user;
    const settings = JSON.parse(localStorage.getItem('userSettings'))||{};
    if (!settings.theme && user?.domain) {
      if (user.domain === 'Médecine') document.body.classList.add('medicine-theme');
      else if (user.domain === 'Droit') document.body.classList.add('law-theme');
    }
  } catch {}
}

function setupStyleEventListeners() {
  window.removeEventListener('settings-updated', handleSettingsUpdate);
  window.removeEventListener('storage', handleStorageChange);
  window.addEventListener('settings-updated', handleSettingsUpdate);
  window.addEventListener('storage', handleStorageChange);
}

function handleSettingsUpdate(e) {
  if (e?.detail) applyStylePreferences(e.detail);
}
function handleStorageChange(e) {
  if (e.key==='userSettings' && e.newValue) {
    try { applyStylePreferences(JSON.parse(e.newValue)); } catch {}
  }
}

export function applyStylePreferences(settings={}) {
  if (settings.darkMode!==undefined) {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }
  if (settings.fontSize) {
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
  }
  if (settings.theme) {
    setColorTheme(settings.theme);
  } else {
    applyDomainTheme();
  }
}
<<<<<<< HEAD

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
=======
// style.js - Gestion des thèmes et préférences
let stylesApplied = false;

export function initStyles() {
  if (stylesApplied) {
    console.log("Styles déjà initialisés, skip.");
    return;
  }
  console.log("⚙️ Initialisation des styles...");
  applySavedSettings();
  setupStyleEventListeners();
  stylesApplied = true;
}

function applySavedSettings() {
  try {
    const raw = localStorage.getItem('userSettings');
    if (!raw) return;
    const settings = JSON.parse(raw);
    applyStylePreferences(settings);
  } catch (e) {
    console.error("Erreur appli style:", e);
  }
}

function setColorTheme(theme) {
  document.body.classList.remove('medicine-theme','law-theme','neutral-theme');
  if (theme==='medicine') document.body.classList.add('medicine-theme');
  else if (theme==='law') document.body.classList.add('law-theme');
  else if (theme==='neutral') document.body.classList.add('neutral-theme');
}

function applyDomainTheme() {
  try {
    const user = JSON.parse(localStorage.getItem('authData'))?.user;
    const settings = JSON.parse(localStorage.getItem('userSettings'))||{};
    if (!settings.theme && user?.domain) {
      if (user.domain === 'Médecine') document.body.classList.add('medicine-theme');
      else if (user.domain === 'Droit') document.body.classList.add('law-theme');
    }
  } catch {}
}

function setupStyleEventListeners() {
  window.removeEventListener('settings-updated', handleSettingsUpdate);
  window.removeEventListener('storage', handleStorageChange);
  window.addEventListener('settings-updated', handleSettingsUpdate);
  window.addEventListener('storage', handleStorageChange);
}

function handleSettingsUpdate(e) {
  if (e?.detail) applyStylePreferences(e.detail);
}
function handleStorageChange(e) {
  if (e.key==='userSettings' && e.newValue) {
    try { applyStylePreferences(JSON.parse(e.newValue)); } catch {}
  }
}

export function applyStylePreferences(settings={}) {
  if (settings.darkMode!==undefined) {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }
  if (settings.fontSize) {
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
  }
  if (settings.theme) {
    setColorTheme(settings.theme);
  } else {
    applyDomainTheme();
  }
}
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
=======
>>>>>>> AuthGoogle
