<<<<<<< HEAD
// router.js 

export const router = {
    routes: {
      '/': { init: () => showPage('home'), title: 'Accueil - Knowledge Quest' },
      '/index.html': { init: () => showPage('home'), title: 'Accueil - Knowledge Quest' },
      '/login.html': { init: () => showPage('login'), title: 'Connexion - Knowledge Quest' },
      '/register.html': { init: () => showPage('register'), title: 'Inscription - Knowledge Quest' },
      '/dashboard.html': { init: () => showPage('dashboard'), title: 'Tableau de bord - Knowledge Quest', protected: true },
      '/home.html': { init: () => showPage('home'), title: 'Accueil - Knowledge Quest', protected: true },
      '/upload-document.html': { init: () => showPage('upload-document'), title: 'Charger un document - Knowledge Quest', protected: true },
      '/create-qcm.html': { init: () => showPage('create-qcm'), title: 'Créer un QCM - Knowledge Quest', protected: true },
      '/take-test.html': { init: () => showPage('take-test'), title: 'Test QCM - Knowledge Quest', protected: true },
      '/results.html': { init: () => showPage('results'), title: 'Résultats - Knowledge Quest', protected: true },
      '/stats.html': { init: () => showPage('stats'), title: 'Statistiques - Knowledge Quest', protected: true },
      '/settings.html': { init: () => showPage('settings'), title: 'Paramètres - Knowledge Quest', protected: true },
      '/profile.html': { init: () => showPage('profile'), title: 'Profil - Knowledge Quest', protected: true }
    },
  
    currentRoute: null,
  
    init() {
      window.addEventListener('popstate', this.handleRoute.bind(this));
      document.addEventListener('click', this.handleLinkClick.bind(this));
  
      this.checkAuthProtection();
      this.handleRoute();
    },
  
    navigateTo(path, updateHistory = true) {
      if (updateHistory) {
        history.pushState(null, null, path);
      }
      this.handleRoute();
    },
  
    handleRoute() {
      const path = window.location.pathname;
      const route = this.getRoute(path);
  
      if (route.protected && !window.auth?.isLoggedIn) {
        this.redirectToLogin();
        return;
      }
  
      document.title = route.title || 'Knowledge Quest';
      route.init();
      this.updateActiveNavigation(path);
      this.currentRoute = path;
    },
  
    handleLinkClick(e) {
      const link = e.target.closest('[data-link]');
      if (link) {
        const href = link.getAttribute('href');
        if (href.startsWith('http') || href.startsWith('//')) return;
  
        e.preventDefault();
        this.navigateTo(href);
      }
    },
  
    getRoute(path) {
      return this.routes[path] || this.routes['/'];
    },
  
    redirectToLogin() {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      window.location.href = 'login.html?redirect=true';
    },
  
    checkAuthProtection() {
      const path = window.location.pathname;
      const route = this.getRoute(path);
  
      if (route.protected && !window.auth?.isLoggedIn) {
        this.redirectToLogin();
      } else if ((path === '/login.html' || path === '/register.html') && window.auth?.isLoggedIn) {
        this.navigateTo('/dashboard.html');
      } else if (window.auth?.isLoggedIn && localStorage.getItem('redirectAfterLogin')) {
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        this.navigateTo(redirectPath);
      }
    },
  
    updateActiveNavigation(path) {
      document.querySelectorAll('[data-link]').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === path);
      });
  
      document.querySelectorAll('.sidebar .nav-item').forEach(item => {
        const link = item.querySelector('a');
        item.classList.toggle('active', link?.getAttribute('href') === path);
      });
    }
  };
  
  // Fonction globale à définir dans index.js ou pages.js
  function showPage(pageName) {
    if (window.setupPages) {
      window.setupPages(pageName);
    } else {
      console.error('❌ setupPages n’est pas défini.');
    }
  }
  
=======
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
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
