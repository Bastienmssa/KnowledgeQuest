/**
 * Contient des fichiers pour les composants réutilisables de l'application
 * Chaque composant est souvent dans son propre fichier (Header, Footer, Button, etc.)
 */

import { initNavigation } from './navigation.js';
import { initForms } from './forms.js';
import { initCharts } from './charts.js';
import { initQcmCards } from './qcm-card.js';

// Fonction d'initialisation des composants
export function setupComponents() {
    console.log("Setting up reusable components...");
    
    // Initialiser les composants
    initHeader();
    initFeatureCards();
    initNavigation();
    initForms();
    initCharts();
    initQcmCards();
}

// Initialiser le composant d'en-tête
function initHeader() {
    console.log("Initializing header component...");
    
    // Rendre l'en-tête fixe au défilement
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (!header) return;
        
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
        
        // Animation au chargement de la page
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * Array.prototype.indexOf.call(featureCards, card));
    });
}

// Fonction pour créer un élément de message d'alerte
export function createAlert(message, type = 'info') {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    
    // Ajouter un bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => alertElement.remove());
    
    alertElement.appendChild(closeButton);
    
    return alertElement;
}

// Fonction pour afficher un message dans un conteneur
export function showMessage(container, message, type = 'info') {
    const alertElement = createAlert(message, type);
    
    // Vider le conteneur et ajouter le message
    container.innerHTML = '';
    container.appendChild(alertElement);
    
    // Supprimer le message après 5 secondes si c'est une notification
    if (type !== 'error') {
        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    }
}