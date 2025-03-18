/**
 * Contient des fichiers pour les composants réutilisables de l'application
 * Chaque composant est souvent dans son propre fichier (Header, Footer, Button, etc.)
 */

// Fonction d'initialisation des composants
export function setupComponents() {
    console.log("Setting up reusable components...");
    
    // Si nous avions des composants dynamiques à initialiser, ce serait ici
    initHeader();
    initFeatureCards();
}

// Initialiser le composant d'en-tête
function initHeader() {
    console.log("Initializing header component...");
    
    // Rendre l'en-tête fixe au défilement
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            header.style.background = 'white';
        }
    });
}

// Initialiser les cartes de fonctionnalités
function initFeatureCards() {
    console.log("Initializing feature cards...");
    
    // Ajouter des effets aux cartes de fonctionnalités
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        // Initialiser le style pour l'animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
}

// Exporter d'autres fonctions de composants si nécessaire