/**
 * Gestionnaire pour la page de création de QCM
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';

// Initialiser la page de création de QCM
export function initCreateQcmPage() {
    console.log("Initializing create QCM page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const editQcmId = urlParams.get('edit');
    
    if (editQcmId) {
        // Charger le QCM existant pour l'éditer
        loadExistingQcm(editQcmId);
    } else {
        // Mode création
        setupCreateQcmForm();
    }
}

// Charger un QCM existant pour l'édition
async function loadExistingQcm(qcmId) {
    try {
        // Afficher un indicateur de chargement
        const formContainer = document.querySelector('.create-qcm-container');
        if (formContainer) {
            formContainer.innerHTML = '<div class="loading-spinner">Chargement du QCM...</div>';
        }
        
        // Récupérer le QCM
        const response = await window.KnowledgeQuestAPI.getQCMById(qcmId);
        
        if (response.success) {
            // Mettre à jour le titre de la page
            const pageTitle = document.querySelector('h1');
            if (pageTitle) {
                pageTitle.textContent = 'Modifier le QCM';
            }
            
            // Rétablir le formulaire
            setupCreateQcmForm(response.qcm);
        } else {
            showFormError('Erreur lors du chargement du QCM: ' + response.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showFormError('Une erreur est survenue lors du chargement du QCM.');
    }
}

// Configurer le formulaire de création/édition de QCM
function setupCreateQcmForm(qcm = null) {
    // Référence aux éléments du formulaire
    const formContainer = document.querySelector('.create-qcm-container');
    if (!formContainer) return;
    
    // Construire le formulaire
    formContainer.innerHTML = `
        <div class="form-messages"></div>
        <form id="create-qcm-form" class="create-qcm-form">
            <div class="form-header">
                <h2>${qcm ? 'Modifier le QCM' : 'Créer un nouveau QCM'}</h2>
                <p>Définissez les questions et réponses de votre QCM.</p>
            </div>
            
            <div class="form-group">
                <label for="qcm-title">Titre du QCM</label>
                <input type="text" id="qcm-title" name="title" required value="${qcm ? qcm.title : ''}">
            </div>
            
            <div class="form-group">
                <label for="qcm-subject">Matière</label>
                <select id="qcm-subject" name="subject" required>
                    <option value="" disabled ${!qcm ? 'selected' : ''}>Choisissez une matière</option>
                    <option value="Anatomie" ${qcm && qcm.subject === 'Anatomie' ? 'selected' : ''}>Anatomie</option>
                    <option value="Physiologie" ${qcm && qcm.subject === 'Physiologie' ? 'selected' : ''}>Physiologie</option>
                    <option value="Pathologies" ${qcm && qcm.subject === 'Pathologies' ? 'selected' : ''}>Pathologies</option>
                    <option value="Pharmacologie" ${qcm && qcm.subject === 'Pharmacologie' ? 'selected' : ''}>Pharmacologie</option>
                    <option value="Droit civil" ${qcm && qcm.subject === 'Droit civil' ? 'selected' : ''}>Droit civil</option>
                    <option value="Droit pénal" ${qcm && qcm.subject === 'Droit pénal' ? 'selected' : ''}>Droit pénal</option>
                </select>
            </div>
            
            <div class="questions-section">
                <div class="section-header">
                    <h3>Questions</h3>
                    <button type="button" id="add-question-btn" class="btn-secondary">
                        <span class="icon">+</span> Ajouter une question
                    </button>
                </div>
                
                <div id="questions-container" class="questions-container">
                    <!-- Les questions seront ajoutées ici dynamiquement -->
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" id="cancel-btn" class="btn-secondary">Annuler</button>
                <button type="submit" class="btn-primary">${qcm ? 'Mettre à jour' : 'Créer le QCM'}</button>
            </div>
        </form>
    `;
    
    // Ajouter les écouteurs d'événements
    const form = document.getElementById('create-qcm-form');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (form && addQuestionBtn && questionsContainer && cancelBtn) {
        // Bouton d'ajout de question
        addQuestionBtn.addEventListener('click', () => {
            addQuestionToForm(questionsContainer);
        });
        
        // Bouton d'annulation
        cancelBtn.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment annuler? Les modifications non enregistrées seront perdues.')) {
                window.location.href = 'dashboard.html';
            }
        });
        
        // Soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmission(form, qcm?._id);
        });
        
        // Si nous sommes en mode édition, charger les questions existantes
        if (qcm && qcm.questions && qcm.questions.length > 0) {
            qcm.questions.forEach(question => {
                addQuestionToForm(questionsContainer, question);
            });
        } else {
            // Sinon, ajouter une question vide
            addQuestionToForm(questionsContainer);
        }
    }
}

// Ajouter une question au formulaire
function addQuestionToForm(container, questionData = null) {
    const questionIndex = document.querySelectorAll('.question-item').length;
    
    const questionHtml = `
        <div class="question-item" data-index="${questionIndex}">
            <div class="question-header">
                <h3>Question ${questionIndex + 1}</h3>
                <button type="button" class="btn-remove-question">Supprimer</button>
            </div>
            
            <div class="form-group">
                <label for="question-${questionIndex}">Énoncé de la question</label>
                <input type="text" id="question-${questionIndex}" name="questions[${questionIndex}][question]" required value="${questionData ? questionData.question : ''}">
            </div>
            
            <div class="choices-container">
                ${generateChoiceInputs(questionIndex, questionData)}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHtml);
    
    // Ajouter un écouteur pour le bouton de suppression
    const removeButtons = document.querySelectorAll('.btn-remove-question');
    const lastRemoveButton = removeButtons[removeButtons.length - 1];
    
    lastRemoveButton.addEventListener('click', function() {
        const questionItem = this.closest('.question-item');
        questionItem.remove();
        
        // Mettre à jour les numéros de questions
        updateQuestionNumbers();
    });
}

// Générer les inputs pour les choix
function generateChoiceInputs(questionIndex, questionData = null) {
    let choicesHtml = '';
    
    for (let i = 0; i < 4; i++) {
        const choiceValue = questionData && questionData.choices && questionData.choices[i] ? questionData.choices[i] : '';
        const isCorrect = questionData && questionData.correctAnswer === choiceValue;
        
        choicesHtml += `
            <div class="form-group choice-item">
                <label>
                    <input type="radio" name="questions[${questionIndex}][correctAnswer]" value="${i}" ${isCorrect ? 'checked' : ''} required>
                    <input type="text" name="questions[${questionIndex}][choices][${i}]" placeholder="Réponse ${i + 1}" required value="${choiceValue}">
                </label>
            </div>
        `;
    }
    
    return choicesHtml;
}

// Mettre à jour les numéros de questions
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

// Gérer la soumission du formulaire
async function handleFormSubmission(form, qcmId = null) {
    try {
        // Désactiver le bouton de soumission pendant le traitement
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Enregistrement...';
        
        // Récupérer les données du formulaire
        const title = document.getElementById('qcm-title').value;
        const subject = document.getElementById('qcm-subject').value;
        
        // Récupérer les questions
        const questions = [];
        const questionItems = document.querySelectorAll('.question-item');
        
        questionItems.forEach((item, index) => {
            const questionText = item.querySelector(`input[id="question-${index}"]`).value;
            const choices = [];
            const choiceInputs = item.querySelectorAll('input[type="text"][name^="questions"][name$="[choices]"]');
            
            choiceInputs.forEach(input => {
                choices.push(input.value);
            });
            
            const correctAnswerRadio = item.querySelector('input[type="radio"]:checked');
            const correctAnswerIndex = correctAnswerRadio ? parseInt(correctAnswerRadio.value) : 0;
            
            questions.push({
                question: questionText,
                choices: choices,
                correctAnswer: choices[correctAnswerIndex]
            });
        });
        
        // Créer l'objet QCM
        const qcmData = {
            title,
            subject,
            questions
        };
        
        let response;
        
        // Création ou mise à jour du QCM
        if (qcmId) {
            response = await window.KnowledgeQuestAPI.updateQCM(qcmId, qcmData);
        } else {
            response = await window.KnowledgeQuestAPI.createQCM(qcmData);
        }
        
        if (response.success) {
            const messageContainer = document.querySelector('.form-messages');
            showMessage(messageContainer, `QCM ${qcmId ? 'mis à jour' : 'créé'} avec succès!`, 'success');
            
            // Rediriger après un court délai
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showFormError(response.message || `Erreur lors de la ${qcmId ? 'mise à jour' : 'création'} du QCM`);
            
            // Réactiver le bouton
            submitButton.disabled = false;
            submitButton.textContent = qcmId ? 'Mettre à jour' : 'Créer le QCM';
        }
    } catch (error) {
        console.error('Erreur:', error);
        showFormError('Une erreur est survenue lors du traitement de votre demande.');
        
        // Réactiver le bouton
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = qcmId ? 'Mettre à jour' : 'Créer le QCM';
    }
}

// Afficher une erreur de formulaire
function showFormError(message) {
    const messageContainer = document.querySelector('.form-messages');
    if (messageContainer) {
        showMessage(messageContainer, message, 'error');
    } else {
        alert(message);
    }
}