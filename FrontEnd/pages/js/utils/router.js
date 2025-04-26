// router.js – Gestion du routage client-side
const router = {
  routes: {
    '/':               { init: () => showPage('index.html'),               title: 'Accueil - Knowledge Quest' },
    '/index.html':     { init: () => showPage('index.html'),               title: 'Accueil - Knowledge Quest' },
    '/login.html':     { init: () => showPage('login.html'),               title: 'Connexion - Knowledge Quest' },
    '/register.html':  { init: () => showPage('register.html'),            title: 'Inscription - Knowledge Quest' },
    '/dashboard.html': { init: () => showPage('dashboard.html'), protected: true,  title: 'Tableau de bord - Knowledge Quest' },
    '/home.html':      { init: () => showPage('index.html'), protected: true,  title: 'Accueil - Knowledge Quest' },
    '/upload-document.html': { init: () => showPage('upload-document.html'), protected: true, title: 'Charger un document - Knowledge Quest' },
    '/create-qcm.html':      { init: () => showPage('create-qcm.html'),      protected: true, title: 'Créer un QCM - Knowledge Quest' },
    '/take-test.html':       { init: () => showPage('take-test.html'),       protected: true, title: 'Test QCM - Knowledge Quest' },
    '/results.html':         { init: () => showPage('results.html'),         protected: true, title: 'Résultats - Knowledge Quest' },
    '/stats.html':           { init: () => showPage('stats.html'),           protected: true, title: 'Statistiques - Knowledge Quest' },
    '/settings.html':        { init: () => showPage('settings.html'),        protected: true, title: 'Paramètres - Knowledge Quest' },
    '/profile.html':         { init: () => showPage('profile.html'),         protected: true, title: 'Profil - Knowledge Quest' }
  },

  init() {
    window.addEventListener('popstate', this.handleRoute.bind(this));
    document.addEventListener('click', this.handleLinkClick.bind(this));
    this.checkAuthProtection();
    this.handleRoute();
  },

  navigateTo(path, updateHistory = true) {
    if (updateHistory) history.pushState(null, null, path);
    this.handleRoute();
  },

  handleRoute() {
    const path  = window.location.pathname;
    const route = this.routes[path] || this.routes['/'];

    // Si page protégée et non connecté → Accueil
    if (route.protected && !window.auth.isLoggedIn) {
      console.log("Route protégée → Accueil");
      this.navigateTo('/index.html');
      return;
    }

    // Si login/register + déjà connecté → Dashboard
    if ((path === '/login.html' || path === '/register.html') && window.auth.isLoggedIn) {
      console.log("Déjà connecté → Dashboard");
      this.navigateTo('/dashboard.html');
      return;
    }

    document.title = route.title;
    route.init();
    this.updateActiveNavigation(path);
  },

  handleLinkClick(e) {
    const a = e.target.closest('[data-link]');
    if (a) {
      const href = a.getAttribute('href');
      if (!href.startsWith('http') && !href.startsWith('//')) {
        e.preventDefault();
        this.navigateTo(href);
      }
    }
  },

  updateActiveNavigation(path) {
    document.querySelectorAll('[data-link]').forEach(link =>
      link.classList.toggle('active', link.getAttribute('href') === path)
    );
  },

  checkAuthProtection() {
    // Permettre d'initialiser sans boucle
  }
};

export default router;
function showPage(pageName) {
  window.setupPages?.(pageName);
}
