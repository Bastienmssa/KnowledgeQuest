/**
 * Module de gestion de la navigation
 * Gère le menu latéral, la navigation mobile, et les interactions
 */

export function initNavigation() {
    console.log("Initializing navigation...");
    
    initSidebar();
    initMobileMenu();
    initPageTransitions();
}

// Initialiser le menu latéral sur le dashboard
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    console.log("Initializing sidebar...");
    
    // Ajouter des écouteurs d'événements pour les éléments du menu
    const menuItems = sidebar.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Supprimer la classe active de tous les éléments
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Ajouter la classe active à l'élément cliqué
            item.classList.add('active');
        });
    });
    
    // Gestion du mode compacte pour le sidebar (version mobile/tablette)
    const toggleButton = document.querySelector('.sidebar-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('compact');
            document.querySelector('.dashboard-main').classList.toggle('expanded');
        });
    }
}

// Initialiser le menu mobile (hamburger)
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) return;
    
    console.log("Initializing mobile menu...");
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        mobileMenuButton.classList.toggle('active');
        
        // Bloquer le défilement du body lorsque le menu est ouvert
        document.body.classList.toggle('menu-open');
    });
    
    // Fermer le menu mobile lorsqu'un lien est cliqué
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileMenuButton.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// Initialiser les transitions de page
function initPageTransitions() {
    console.log("Initializing page transitions...");
    
    // Détecter les liens internes pour des transitions fluides
    document.querySelectorAll('a[data-transition]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.host === window.location.host) {
                e.preventDefault();
                
                // Ajouter une classe de transition
                document.body.classList.add('page-transition');
                
                // Attendre que l'animation se termine, puis naviguer
                setTimeout(() => {
                    window.location.href = link.href;
                }, 300);
            }
        });
    });
    
    // Animation d'entrée de page
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('page-loaded');
    });
}

// Fonction pour la navigation entre les pages (sans rechargement complet)
export function navigateTo(url) {
    // Animation de sortie
    document.body.classList.add('page-transition');
    
    // Changer l'URL après l'animation
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// Détecter les clics sur les liens de navigation et ajouter des transitions
export function setupNavigationListeners() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Si le lien pointe vers une ancre de la page
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}