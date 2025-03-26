// router.js - Version améliorée
export const router = {
    routes: {
        '/': { init: () => showPage('index'), title: 'Accueil - Knowledge Quest' },
        '/index.html': { init: () => showPage('index'), title: 'Accueil - Knowledge Quest' },
        '/login.html': { init: () => showPage('login'), title: 'Connexion - Knowledge Quest' },
        '/dashboard.html': { init: () => showPage('dashboard'), title: 'Tableau de bord - Knowledge Quest', protected: true },
        '/upload-document.html': { init: () => showPage('upload-document'), title: 'Charger un document - Knowledge Quest', protected: true },
        '/create-qcm.html': { init: () => showPage('create-qcm'), title: 'Créer un QCM - Knowledge Quest', protected: true },
        '/take-test.html': { init: () => showPage('take-test'), title: 'Test QCM - Knowledge Quest', protected: true },
        '/stats.html': { init: () => showPage('stats'), title: 'Statistiques - Knowledge Quest', protected: true },
        '/profile.html': { init: () => showPage('profile'), title: 'Profil - Knowledge Quest', protected: true },
        '/settings.html': { init: () => showPage('settings'), title: 'Paramètres - Knowledge Quest', protected: true },
        '/results.html': { init: () => showPage('results'), title: 'Résultats - Knowledge Quest', protected: true }
    },
    
    currentRoute: null,
    
    init() {
        window.addEventListener('popstate', this.handleRoute.bind(this));
        document.addEventListener('click', this.handleLinkClick.bind(this));
        
        // Initialiser l'authentification
        this.checkAuthProtection();
        
        // Gérer la route initiale
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
        
        // Vérifier si la route est protégée
        if (route.protected && !window.auth.isLoggedIn) {
            this.redirectToLogin();
            return;
        }
        
        // Mettre à jour le titre de la page
        document.title = route.title || 'Knowledge Quest';
        
        // Initialiser la page
        route.init();
        
        // Mettre à jour la navigation active
        this.updateActiveNavigation(path);
        
        // Mémoriser la route courante
        this.currentRoute = path;
    },
    
    handleLinkClick(e) {
        if (e.target.matches('[data-link]') || e.target.closest('[data-link]')) {
            e.preventDefault();
            const link = e.target.matches('[data-link]') ? e.target : e.target.closest('[data-link]');
            const href = link.getAttribute('href');
            
            // Si c'est un lien externe, l'ouvrir normalement
            if (href.startsWith('http') || href.startsWith('//')) {
                window.open(href, '_blank');
                return;
            }
            
            // Navigation interne avec transition
            this.navigateTo(href);
        }
    },
    
    getRoute(path) {
        // Récupérer la définition de la route ou la route par défaut
        return this.routes[path] || this.routes['/'];
    },
    
    redirectToLogin() {
        // Sauvegarder la page d'origine pour y revenir après la connexion
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
        
        // Rediriger vers la page de connexion
        window.location.href = 'login.html?redirect=true';
    },
    
    // Vérifier et gérer les protections d'authentification
    checkAuthProtection() {
        const path = window.location.pathname;
        const route = this.getRoute(path);
        
        if (route.protected && !window.auth.isLoggedIn) {
            this.redirectToLogin();
        } else if (path === '/login.html' && window.auth.isLoggedIn) {
            // Si l'utilisateur est déjà connecté et visite la page de connexion
            // le rediriger vers le tableau de bord
            this.navigateTo('dashboard.html');
        } else if (window.auth.isLoggedIn && localStorage.getItem('redirectAfterLogin')) {
            // Si l'utilisateur vient de se connecter et qu'une redirection est en attente
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            localStorage.removeItem('redirectAfterLogin');
            this.navigateTo(redirectPath);
        }
    },
    
    // Mettre à jour les éléments de navigation actifs
    updateActiveNavigation(path) {
        // Supprimer la classe active de tous les liens
        document.querySelectorAll('[data-link]').forEach(link => {
            link.classList.remove('active');
        });
        
        // Ajouter la classe active au lien correspondant à la page courante
        document.querySelectorAll(`[data-link][href="${path}"]`).forEach(link => {
            link.classList.add('active');
        });
        
        // Gérer également les liens de la barre latérale
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
            
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === path) {
                item.classList.add('active');
            }
        });
    }
};

// Fonction pour afficher une page spécifique (à importer depuis pages.js)
function showPage(pageName) {
    // Cette fonction devrait être importée depuis votre module pages.js
    // Elle devrait initialiser la page appropriée en fonction du nom
    if (window.setupPages) {
        window.setupPages(pageName);
    } else {
        console.error('setupPages function not found');
    }
}