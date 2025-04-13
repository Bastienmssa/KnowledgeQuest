// js/pages/create-qcm-page.js
/**
 * Gestionnaire pour la page de création de QCM
 */
import { auth } from '../utils/auth.js';
import { qcmService } from '../services/qcm-service.js';
import { subjectService } from '../services/subject-service.js';
import { documentService } from '../services/document-service.js';
import { showNotification } from '../components/notification.js';

export async function initCreateQcmPage() {
  console.log("Initialisation de la page de création de QCM...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = '../pages/login.html';
    return;
  }
  
  // Vérifier si nous sommes en mode édition ou création
  const urlParams = new URLSearchParams(window.location.search);
  const editQcmId = urlParams.get('edit');
  const documentId = urlParams.get('document');
  
  // Initialiser le formulaire de base
  setupCreateQcmForm();
  
  // Charger les matières disponibles
  await loadSubjects();
  
  if (editQcmId) {
    // Mode édition: charger les données du QCM existant
    await loadExistingQcm(editQcmId);
  } else if (documentId) {
    // Mode création à partir d'un document: pré-remplir certains champs
    await prepopulateFromDocument(documentId);
  }
}

async function loadSubjects() {
  try {
    const subjectSelect = document.getElementById('qcm-subject');
    if (!subjectSelect) return;
    
    const subjects = await subjectService.getAllSubjects();
    
    if (subjects && subjects.length > 0) {
      // Conserver l'option par défaut
      const defaultOption = subjectSelect.innerHTML;
      
      // Générer les options
      let options = defaultOption;
      subjects.forEach(subject => {
        options += `<option value="${subject.name}">${subject.name}</option>`;
      });
      
      subjectSelect.innerHTML = options;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des matières:', error);
    showNotification('Impossible de charger les matières', 'error');
  }
}

async function loadExistingQcm(qcmId) {
  try {
    const qcm = await qcmService.getQcmById(qcmId);
    
    if (qcm) {
      // Mettre à jour le titre de la page
      document.querySelector('h1').textContent = 'Modifier le QCM';
      
      // Remplir le formulaire avec les données existantes
      document.getElementById('qcm-title').value = qcm.title;
      document.getElementById('qcm-subject').value = qcm.subject;
      
      // Ajouter les questions existantes
      const questionsContainer = document.getElementById('questions-container');
      if (questionsContainer) {
        // Vider le conteneur
        questionsContainer.innerHTML = '';
        
        // Ajouter les questions
        qcm.questions.forEach(question => {
          addQuestionToForm(questionsContainer, question);
        });
      }
      
      // Mettre à jour l'ID du QCM pour le formulaire
      document.getElementById('create-qcm-form').setAttribute('data-qcm-id', qcmId);
    } else {
      showNotification('Impossible de charger le QCM', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur lors du chargement du QCM', 'error');
  }
}

async function prepopulateFromDocument(documentId) {
  // Pour l'instant, on ne fait rien de spécial avec le document
  // Dans une version future, on pourrait extraire des informations du document
}

function setupCreateQcmForm() {
  const form = document.getElementById('create-qcm-form');
  const addQuestionBtn = document.getElementById('add-question-btn');
  const questionsContainer = document.getElementById('questions-container');
  
  if (form && addQuestionBtn && questionsContainer) {
    // Ajouter une première question vide
    addQuestionToForm(questionsContainer);
    
    // Ajouter un écouteur pour le bouton d'ajout de question
    addQuestionBtn.addEventListener('click', () => {
      addQuestionToForm(questionsContainer);
    });
    
    // Gérer la soumission du formulaire
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleFormSubmission(form);
    });
  }
}

function addQuestionToForm(container, questionData = null) {
  const questionIndex = container.children.length;
  
  const questionItem = document.createElement('div');
  questionItem.className = 'question-item';
  questionItem.dataset.index = questionIndex;
  
  questionItem.innerHTML = `
    <div class="question-header">
      <h3>Question ${questionIndex + 1}</h3>
      <button type="button" class="btn-remove-question" data-index="${questionIndex}">Supprimer</button>
    </div>
    <div class="form-group">
      <label for="question-${questionIndex}">Question</label>
      <textarea id="question-${questionIndex}" name="questions[${questionIndex}][question]" required>${questionData ? questionData.question : ''}</textarea>
    </div>
    <div class="choices-container">
      <h4>Choix de réponses</h4>
      ${generateChoicesHTML(questionIndex, questionData)}
    </div>
    <div class="form-group">
      <label>Réponse correcte</label>
      <div class="correct-answer-selector">
        ${generateCorrectAnswerHTML(questionIndex, questionData)}
      </div>
    </div>
  `;
  
  container.appendChild(questionItem);
  
  // Ajouter des écouteurs pour le bouton de suppression
  const removeButton = questionItem.querySelector('.btn-remove-question');
  if (removeButton) {
    removeButton.addEventListener('click', () => {
      container.removeChild(questionItem);
      // Mettre à jour les indices
      updateQuestionIndices(container);
    });
  }
}

function generateChoicesHTML(questionIndex, questionData = null) {
  let html = '';
  
  for (let i = 0; i < 4; i++) {
    const choiceValue = questionData && questionData.choices && questionData.choices[i] ? questionData.choices[i] : '';
    html += `
      <div class="form-group">
        <label for="choice-${questionIndex}-${i}">Choix ${i + 1}</label>
        <input type="text" id="choice-${questionIndex}-${i}" name="questions[${questionIndex}][choices][${i}]" value="${choiceValue}" required>
      </div>
    `;
  }
  
  return html;
}

function generateCorrectAnswerHTML(questionIndex, questionData = null) {
  let html = '';
  
  for (let i = 0; i < 4; i++) {
    const choiceValue = questionData && questionData.choices && questionData.choices[i] ? questionData.choices[i] : '';
    const isChecked = questionData && questionData.correctAnswer === choiceValue ? 'checked' : '';
    
    html += `
      <div class="radio-option">
        <input type="radio" id="correct-${questionIndex}-${i}" name="questions[${questionIndex}][correctAnswer]" value="${i}" ${isChecked} required>
        <label for="correct-${questionIndex}-${i}">Choix ${i + 1}</label>
      </div>
    `;
  }
  
  return html;
}

function updateQuestionIndices(container) {
  const questions = container.querySelectorAll('.question-item');
  
  questions.forEach((question, index) => {
    // Mettre à jour l'indice dans le dataset
    question.dataset.index = index;
    
    // Mettre à jour le titre
    const header = question.querySelector('.question-header h3');
    if (header) header.textContent = `Question ${index + 1}`;
    
    // Mettre à jour les noms et IDs des champs
    question.querySelector('textarea').name = `questions[${index}][question]`;
    question.querySelector('textarea').id = `question-${index}`;
    
    // Mettre à jour les choix
    const choiceInputs = question.querySelectorAll('.choices-container input');
    choiceInputs.forEach((input, choiceIndex) => {
      input.name = `questions[${index}][choices][${choiceIndex}]`;
      input.id = `choice-${index}-${choiceIndex}`;
    });
    
    // Mettre à jour les radios de réponse correcte
    const radioInputs = question.querySelectorAll('.correct-answer-selector input');
    radioInputs.forEach((input, radioIndex) => {
      input.name = `questions[${index}][correctAnswer]`;
      input.id = `correct-${index}-${radioIndex}`;
    });
    
    // Mettre à jour le bouton de suppression
    const removeButton = question.querySelector('.btn-remove-question');
    if (removeButton) removeButton.dataset.index = index;
  });
}

async function handleFormSubmission(form) {
  try {
    const formData = new FormData(form);
    const qcmData = {
      title: formData.get('title'),
      subject: formData.get('subject'),
      questions: []
    };
    
    // Récupérer les questions et leurs choix
    const questions = form.querySelectorAll('.question-item');
    questions.forEach((questionElem, index) => {
      const questionText = formData.get(`questions[${index}][question]`);
      const correctAnswerIndex = formData.get(`questions[${index}][correctAnswer]`);
      
      // Récupérer les choix pour cette question
      const choices = [];
      for (let i = 0; i < 4; i++) {
        choices.push(formData.get(`questions[${index}][choices][${i}]`));
      }
      
      qcmData.questions.push({
        question: questionText,
        choices: choices,
        correctAnswer: choices[correctAnswerIndex]
      });
    });
    
    // Déterminer si c'est une création ou une mise à jour
    const qcmId = form.getAttribute('data-qcm-id');
    let qcm;
    
    if (qcmId) {
      qcm = await qcmService.updateQcm(qcmId, qcmData);
    } else {
      qcm = await qcmService.createQcm(qcmData);
    }
    
    showNotification('QCM enregistré avec succès!', 'success');
    
    // Rediriger vers la page de test
    setTimeout(() => {
      window.location.href = `../pages/take-test.html?qcmId=${qcm._id}`;
    }, 1000);
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(error.message || 'Erreur lors de l\'enregistrement', 'error');
  }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initCreateQcmPage);