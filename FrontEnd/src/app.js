/**
 * Composant principal de l'application qui assemble les autres composants
 * et définit la structure de base de l'application.
 */

// Fonction d'initialisation de l'application
export function initializeApp() {
    console.log("Initializing main application components...");
    
    // Attacher les écouteurs d'événements pour les boutons de navigation
    setupNavigationListeners();
    
    // Initialiser les animations de la page d'accueil
    initHomeAnimations();
}

// Mettre en place les écouteurs pour la navigation
function setupNavigationListeners() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
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
    
    // Gérer le bouton "Commencer"
    const startButton = document.querySelector('.btn-large');
    if (startButton) {
        startButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Start button clicked - redirecting to registration...");
            // À implémenter: redirection vers la page d'inscription
            window.location.href = "#creer-compte";
        });
    }
}

// Initialiser les animations pour la page d'accueil
function initHomeAnimations() {
    // Animation pour les cartes de fonctionnalités
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
        // Ajouter un léger délai pour chaque carte
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * index);
    });
}

// Exporter d'autres fonctions si nécessaire