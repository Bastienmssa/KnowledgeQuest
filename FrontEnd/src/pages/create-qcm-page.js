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
                    <option value="Droit constitutionnel" ${qcm && qcm.subject === 'Droit constitutionnel' ? 'selected' : ''}>Droit constitutionnel</option>
                    <option value="Droit administratif" ${qcm && qcm.subject === 'Droit administratif' ? 'selected' : ''}>Droit administratif</option>
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
            
            <div class="qcm-templates">
                <h3>Modèles de QCM</h3>
                <p>Utilisez un modèle pour démarrer plus rapidement</p>
                
                <div class="templates-grid">
                    <div class="template-card" data-template="medicine-anatomy">
                        <h4>Anatomie</h4>
                        <p>5 questions pré-formatées sur l'anatomie humaine</p>
                        <button class="btn-secondary">Utiliser</button>
                    </div>
                    <div class="template-card" data-template="medicine-pathology">
                        <h4>Pathologies</h4>
                        <p>8 questions sur les pathologies courantes</p>
                        <button class="btn-secondary">Utiliser</button>
                    </div>
                    <div class="template-card" data-template="law-civil">
                        <h4>Droit civil</h4>
                        <p>6 questions sur les principes du droit civil</p>
                        <button class="btn-secondary">Utiliser</button>
                    </div>
                    <div class="template-card" data-template="law-criminal">
                        <h4>Droit pénal</h4>
                        <p>7 questions sur les bases du droit pénal</p>
                        <button class="btn-secondary">Utiliser</button>
                    </div>
                    <div class="template-card" data-template="law-administrative">
                        <h4>Droit administratif</h4>
                        <p>6 questions sur le droit administratif</p>
                        <button class="btn-secondary">Utiliser</button>
                    </div>
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
    const templateCards = document.querySelectorAll('.template-card');
    
    if (form && addQuestionBtn && questionsContainer && cancelBtn && templateCards) {
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
        
        // Ajouter les écouteurs d'événements pour les modèles de QCM
        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.template;
                loadQcmTemplate(templateId, questionsContainer);
            });
        });
    }
}

// Ajouter une question au formulaire
function addQuestionToForm(container, questionData = null) {
    // ... (code existant)
}

// Générer les inputs pour les choix
function generateChoiceInputs(questionIndex, questionData = null) {
    // ... (code existant)
}

// Mettre à jour les numéros de questions
function updateQuestionNumbers() {
    // ... (code existant)
}

// Gérer la soumission du formulaire
async function handleFormSubmission(form, qcmId = null) {
    // ... (code existant)
}

// Afficher une erreur de formulaire
function showFormError(message) {
    // ... (code existant)
}

// Charger un modèle de QCM
async function loadQcmTemplate(templateId, container) {
    try {
        const response = await window.KnowledgeQuestAPI.getQcmTemplate(templateId);
        
        if (response.success) {
            // Vider le conteneur des questions
            container.innerHTML = '';
            
            // Ajouter les questions du modèle
            response.template.questions.forEach(question => {
                addQuestionToForm(container, question);
            });
        } else {
            showFormError(`Erreur lors du chargement du modèle "${templateId}": ${response.message}`);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du modèle:', error);
        showFormError('Une erreur est survenue lors du chargement du modèle de QCM.');
    }
}