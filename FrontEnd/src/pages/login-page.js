/**
 * Gestionnaire pour la page de connexion et d'accueil
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';

// Initialiser la page d'accueil/connexion
export function initHomePage() {
    console.log("Initializing home/login page...");
    
    // Vérifier si l'utilisateur est déjà connecté
    if (auth && auth.isLoggedIn) {
        // Si c'est le cas et que nous sommes sur la page de connexion, rediriger vers la page d'accueil
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'home.html';
            return;
        }
    }
    
    // Ajouter des animations pour les sections de la page d'accueil
    initHomeAnimations();
    
    // Initialiser les onglets de connexion/inscription
    initAuthTabs();
    
    // Initialiser les écouteurs des boutons CTA
    initHomeButtons();
}

// Animations de la page d'accueil
function initHomeAnimations() {
    // Animer les sections au défilement
    const sections = document.querySelectorAll('section');
    
    if (sections.length > 0) {
        // Observer l'intersection pour déclencher des animations au défilement
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        sections.forEach(section => {
            section.classList.add('animate-section');
            observer.observe(section);
        });
    }
    
    // Animation pour l'image principale
    const heroImage = document.querySelector('.hero-image img');
    if (heroImage) {
        heroImage.classList.add('float-animation');
    }
}

// Initialiser les onglets de connexion/inscription
function initAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (!tabButtons.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');
            
            // Afficher le contenu de l'onglet correspondant
            const tabId = button.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.add('hidden');
            });
            
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

// Initialiser les écouteurs des boutons de la page d'accueil
function initHomeButtons() {
    // Gérer le bouton "Commencer"
    const startButton = document.querySelector('.btn-large');
    if (startButton) {
        startButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Start button clicked - redirecting to login...");
            window.location.href = "login.html";
        });
    }
    
    // Gérer les boutons de connexion/inscription
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin(e.target);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegistration(e.target);
        });
    }
}

async function handleLogin(form) {
    try {
        const messageContainer = document.querySelector('.auth-messages');
        
        // Désactiver le bouton pendant la connexion
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Connexion...';
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const result = await auth.login(email, password);
        
        if (result.success) {
            showMessage(messageContainer, 'Connexion réussie! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            showMessage(messageContainer, result.message || 'Échec de la connexion', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Se connecter';
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        const messageContainer = document.querySelector('.auth-messages');
        showMessage(messageContainer, 'Erreur de connexion au serveur', 'error');
        
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Se connecter';
    }
}

async function handleRegistration(form) {
    try {
        const messageContainer = document.querySelector('.auth-messages');
        
        // Désactiver le bouton pendant l'inscription
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Création du compte...';
        
        const userData = {
            firstName: document.getElementById('register-firstname').value,
            lastName: document.getElementById('register-lastname').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value,
            domain: document.getElementById('register-domain').value
        };
        
        const result = await auth.register(userData);
        
        if (result.success) {
            showMessage(messageContainer, 'Compte créé avec succès! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            showMessage(messageContainer, result.message || 'Échec de l\'inscription', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Créer un compte';
        }
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        const messageContainer = document.querySelector('.auth-messages');
        showMessage(messageContainer, 'Erreur de connexion au serveur', 'error');
        
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Créer un compte';
    }
}