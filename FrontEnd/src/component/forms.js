/**
 * Module pour gérer les formulaires dans l'application
 */

export function initForms() {
    console.log("Initializing forms...");
    
    initLoginForm();
    initRegistrationForm();
    initCreateQcmForm();
    initProfileForm();
    initPasswordForm();
}

// Initialiser le formulaire de connexion
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    console.log("Initializing login form...");
    
    // Ajouter la validation du formulaire
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        
        // Validation simple
        if (!validateEmail(email.value)) {
            showFormError(email, 'Veuillez entrer une adresse email valide');
            return;
        }
        
        if (password.value.length < 6) {
            showFormError(password, 'Le mot de passe doit comporter au moins 6 caractères');
            return;
        }
        
        // Si la validation est réussie, on peut soumettre le formulaire
        // La soumission réelle est gérée dans auth.js
        console.log("Login form validated");
    });
}

// Initialiser le formulaire d'inscription
function initRegistrationForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    console.log("Initializing registration form...");
    
    // Ajouter la validation du formulaire
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstname = document.getElementById('register-firstname');
        const lastname = document.getElementById('register-lastname');
        const email = document.getElementById('register-email');
        const password = document.getElementById('register-password');
        const domain = document.getElementById('register-domain');
        
        // Validation simple
        if (firstname.value.trim() === '') {
            showFormError(firstname, 'Le prénom est requis');
            return;
        }
        
        if (lastname.value.trim() === '') {
            showFormError(lastname, 'Le nom est requis');
            return;
        }
        
        if (!validateEmail(email.value)) {
            showFormError(email, 'Veuillez entrer une adresse email valide');
            return;
        }
        
        if (password.value.length < 6) {
            showFormError(password, 'Le mot de passe doit comporter au moins 6 caractères');
            return;
        }
        
        if (domain.value === '') {
            showFormError(domain, 'Veuillez sélectionner un domaine');
            return;
        }
        
        // Si la validation est réussie, on peut soumettre le formulaire
        // La soumission réelle est gérée dans auth.js
        console.log("Registration form validated");
    });
}

// Initialiser le formulaire de création de QCM
function initCreateQcmForm() {
    const qcmForm = document.getElementById('create-qcm-form');
    if (!qcmForm) return;
    
    console.log("Initializing create QCM form...");
    
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    
    if (addQuestionBtn && questionsContainer) {
        // Ajouter une question au formulaire
        addQuestionBtn.addEventListener('click', () => {
            const questionIndex = document.querySelectorAll('.question-item').length;
            
            const questionHtml = `
                <div class="question-item" data-index="${questionIndex}">
                    <div class="question-header">
                        <h3>Question ${questionIndex + 1}</h3>
                        <button type="button" class="btn-remove-question">Supprimer</button>
                    </div>
                    
                    <div class="form-group">
                        <label for="question-${questionIndex}">Énoncé de la question</label>
                        <input type="text" id="question-${questionIndex}" name="questions[${questionIndex}][question]" required>
                    </div>
                    
                    <div class="choices-container">
                        <div class="form-group choice-item">
                            <label>
                                <input type="radio" name="questions[${questionIndex}][correctAnswer]" value="0" required>
                                <input type="text" name="questions[${questionIndex}][choices][0]" placeholder="Réponse 1" required>
                            </label>
                        </div>
                        
                        <div class="form-group choice-item">
                            <label>
                                <input type="radio" name="questions[${questionIndex}][correctAnswer]" value="1">
                                <input type="text" name="questions[${questionIndex}][choices][1]" placeholder="Réponse 2" required>
                            </label>
                        </div>
                        
                        <div class="form-group choice-item">
                            <label>
                                <input type="radio" name="questions[${questionIndex}][correctAnswer]" value="2">
                                <input type="text" name="questions[${questionIndex}][choices][2]" placeholder="Réponse 3" required>
                            </label>
                        </div>
                        
                        <div class="form-group choice-item">
                            <label>
                                <input type="radio" name="questions[${questionIndex}][correctAnswer]" value="3">
                                <input type="text" name="questions[${questionIndex}][choices][3]" placeholder="Réponse 4" required>
                            </label>
                        </div>
                    </div>
                </div>
            `;
            
            questionsContainer.insertAdjacentHTML('beforeend', questionHtml);
            
            // Ajouter un écouteur pour le bouton de suppression
            const removeButtons = document.querySelectorAll('.btn-remove-question');
            const lastRemoveButton = removeButtons[removeButtons.length - 1];
            
            lastRemoveButton.addEventListener('click', function() {
                const questionItem = this.closest('.question-item');
                questionItem.remove();
                
                // Mettre à jour les numéros de questions
                updateQuestionNumbers();
            });
        });
        
        // Ajouter la première question par défaut
        if (questionsContainer.children.length === 0) {
            addQuestionBtn.click();
        }
    }
    
    // Mise à jour des numéros de questions
    function updateQuestionNumbers() {
        const questions = document.querySelectorAll('.question-item');
        
        questions.forEach((question, index) => {
            const header = question.querySelector('h3');
            if (header) header.textContent = `Question ${index + 1}`;
            
            // Mettre à jour les indices dans les attributs name
            question.setAttribute('data-index', index);
            
            const questionInput = question.querySelector(`input[id^="question-"]`);
            if (questionInput) {
                questionInput.id = `question-${index}`;
                questionInput.name = `questions[${index}][question]`;
            }
            
            const radioInputs = question.querySelectorAll('input[type="radio"]');
            radioInputs.forEach(input => {
                input.name = `questions[${index}][correctAnswer]`;
            });
            
            const choiceInputs = question.querySelectorAll('input[type="text"][name^="questions"][name$="[choices]"]');
            choiceInputs.forEach((input, choiceIndex) => {
                input.name = `questions[${index}][choices][${choiceIndex}]`;
            });
        });
    }
}

// Initialiser le formulaire de profil
function initProfileForm() {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;
    
    console.log("Initializing profile form...");
    
    // Ajouter la validation du formulaire
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstname = document.getElementById('user-firstname');
        const lastname = document.getElementById('user-lastname');
        const email = document.getElementById('user-email');
        
        // Validation simple
        if (firstname.value.trim() === '') {
            showFormError(firstname, 'Le prénom est requis');
            return;
        }
        
        if (lastname.value.trim() === '') {
            showFormError(lastname, 'Le nom est requis');
            return;
        }
        
        if (!validateEmail(email.value)) {
            showFormError(email, 'Veuillez entrer une adresse email valide');
            return;
        }
        
        // Si la validation est réussie, on peut soumettre le formulaire
        console.log("Profile form validated");
    });
}

// Initialiser le formulaire de changement de mot de passe
function initPasswordForm() {
    const passwordForm = document.getElementById('password-form');
    if (!passwordForm) return;
    
    console.log("Initializing password form...");
    
    // Ajouter la validation du formulaire
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password');
        const newPassword = document.getElementById('new-password');
        const confirmPassword = document.getElementById('confirm-password');
        
        // Validation simple
        if (currentPassword.value.length < 6) {
            showFormError(currentPassword, 'Le mot de passe doit comporter au moins 6 caractères');
            return;
        }
        
        if (newPassword.value.length < 6) {
            showFormError(newPassword, 'Le nouveau mot de passe doit comporter au moins 6 caractères');
            return;
        }
        
        if (newPassword.value !== confirmPassword.value) {
            showFormError(confirmPassword, 'Les mots de passe ne correspondent pas');
            return;
        }
        
        // Si la validation est réussie, on peut soumettre le formulaire
        console.log("Password form validated");
    });
}

// Fonctions utilitaires pour les formulaires

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function showFormError(inputElement, message) {
    // Supprimer les messages d'erreur existants
    const parentElement = inputElement.parentElement;
    const existingError = parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Ajouter la classe d'erreur à l'input
    inputElement.classList.add('input-error');
    
    // Créer et ajouter le message d'erreur
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    parentElement.appendChild(errorElement);
    
    // Mettre le focus sur l'input
    inputElement.focus();
    
    // Supprimer l'erreur lorsque l'utilisateur commence à taper
    inputElement.addEventListener('input', function() {
        this.classList.remove('input-error');
        const error = parentElement.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    }, { once: true });
}