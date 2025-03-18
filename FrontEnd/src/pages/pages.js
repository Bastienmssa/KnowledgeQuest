/**
 * Contient des fichiers pour les différentes pages ou vues de l'application
 * Chaque page peut être composée de plusieurs composants
 */

// Fonction d'initialisation des pages
export function setupPages() {
    console.log("Setting up application pages...");
    
    // Initialiser la page d'accueil
    initHomePage();
}

// Initialiser les fonctionnalités spécifiques à la page d'accueil
function initHomePage() {
    console.log("Initializing home page...");
    
    // Ajouter des animations pour les sections de la page d'accueil
    const sections = document.querySelectorAll('section');
    
    // Observer l'intersection pour déclencher des animations au défilement
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Exporter d'autres fonctions spécifiques aux pages si nécessaire