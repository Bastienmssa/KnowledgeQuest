// js/utils/forms.js
/**
 * Module pour gérer les formulaires dans l'application
 */
import { authService } from '../services/auth-service.js';
import { qcmService } from '../services/qcm-service.js';
import { subjectService } from '../services/subject-service.js';
import { showNotification } from '../components/notification.js';

export function initForms() {
  console.log("Initializing forms...");
  
  initLoginForm();
  initRegistrationForm();
  initCreateQcmForm();
  initProfileForm();
  initPasswordForm();
  initSearchForm();
}

function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  
  console.log("Initializing login form...");
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      await authService.login(email, password);
      window.location.href = '../pages/dashboard.html';
    } catch (error) {
      showNotification(error.message, 'error');
    }
  });
}

function initRegistrationForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;
  
  console.log("Initializing registration form...");
  
  loadDomains();
  
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('register-firstname').value;
    const lastName = document.getElementById('register-lastname').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password')?.value;
    const domain = document.getElementById('register-domain').value;
    const termsCheckbox = document.getElementById('terms');
    
    // Validation simple
    if (!firstName || !lastName || !email || !password || !domain) {
      showFormError(firstName || email || password, 'Champ requis');
      return;
    }
    
    if (confirmPassword && password !== confirmPassword) {
      showFormError(confirmPassword, 'Les mots de passe ne correspondent pas');
      return;
    }
    
    if (termsCheckbox && !termsCheckbox.checked) {
      showFormError(termsCheckbox, 'Vous devez accepter les conditions d\'utilisation');
      return;
    }
    
    try {
      await authService.register({
        name: `${firstName} ${lastName}`,
        email,
        password,
        domain
      });
      
      showNotification('Compte créé avec succès! Redirection...', 'success');
      setTimeout(() => {
        window.location.href = '../pages/dashboard.html';
      }, 1000);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  });
}

async function loadDomains() {
  const domainSelect = document.getElementById('register-domain');
  if (!domainSelect) return;
  
  try {
    const subjects = await subjectService.getAllSubjects();
    
    if (subjects && subjects.length > 0) {
      // Conserver l'option par défaut
      const defaultOption = domainSelect.innerHTML;
      
      // Générer les options
      let options = defaultOption;
      subjects.forEach(subject => {
        options += `<option value="${subject.name}">${subject.name}</option>`;
      });
      
      domainSelect.innerHTML = options;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des domaines:', error);
    
    // Ajouter des domaines par défaut en cas d'erreur
    const defaultDomains = [
      { value: 'Médecine', label: 'Médecine' },
      { value: 'Droit', label: 'Droit' }
    ];
    
    defaultDomains.forEach(domain => {
      const option = document.createElement('option');
      option.value = domain.value;
      option.textContent = domain.label;
      domainSelect.appendChild(option);
    });
  }
}

function initCreateQcmForm() {
  const qcmForm = document.getElementById('create-qcm-form');
  if (!qcmForm) return;
  
  console.log("Initializing create QCM form...");
  
  loadSubjects();
  
  const addQuestionBtn = document.getElementById('add-question-btn');
  const questionsContainer = document.getElementById('questions-container');
  
  if (addQuestionBtn && questionsContainer) {
    addQuestionBtn.addEventListener('click', () => {
      const questionCount = document.querySelectorAll('.question-item').length;
      addNewQuestion(questionsContainer, questionCount);
    });
    
    if (questionsContainer.children.length === 0) {
      addQuestionBtn.click();
    }
  }
  
  qcmForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('qcm-title');
    const subject = document.getElementById('qcm-subject');
    
    // Validation simple
    if (!title.value) {
      showFormError(title, 'Titre requis');
      return;
    }
    
    if (!subject.value) {
      showFormError(subject, 'Matière requise');
      return;
    }
    
    try {
      const qcmData = {
        title: title.value,
        subject: subject.value,
        questions: []
      };
      
      const questions = document.querySelectorAll('.question-item');
      questions.forEach((questionElem, index) => {
        const questionText = questionElem.querySelector('input[name^="questions"][name$="[question]"]').value;
        const correctAnswerIndex = parseInt(questionElem.querySelector('input[name^="questions"][name$="[correctAnswer]"]:checked').value);
        const choices = [];
        
        questionElem.querySelectorAll(`input[name^="questions[${index}][choices]"]`).forEach(input => {
          choices.push(input.value);
        });
        
        qcmData.questions.push({
          question: questionText,
          choices,
          correctAnswer: choices[correctAnswerIndex]
        });
      });
      
      const qcmId = qcmForm.getAttribute('data-qcm-id');
      let response;
      
      if (qcmId) {
        response = await qcmService.updateQcm(qcmId, qcmData);
      } else {
        response = await qcmService.createQcm(qcmData);
      }
      
      if (response.success) {
        window.location.href = `../pages/take-test.html?qcmId=${response.qcm._id}`;
      } else {
        showFormError(null, response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showFormError(null, 'Erreur lors de l\'enregistrement');
    }
  });
}

async function loadSubjects() {
  const subjectSelect = document.getElementById('qcm-subject');
  if (!subjectSelect) return;
  
  try {
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
    console.error('Erreur lors du chargement des sujets:', error);
  }
}

function addNewQuestion(container, questionIndex) {
  const questionItem = document.createElement('div');
  questionItem.className = 'question-item';
  questionItem.setAttribute('data-index', questionIndex);
  
  questionItem.innerHTML = `
    <div class="question-header">
      <h3>Question ${questionIndex + 1}</h3>
      <button type="button" class="btn-remove-question">Supprimer</button>
    </div>
    
    <div class="form-group">
      <label for="question-${questionIndex}">Énoncé de la question</label>
      <textarea id="question-${questionIndex}" name="questions[${questionIndex}][question]" required></textarea>
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
  `;
  
  container.appendChild(questionItem);
  
  const removeButton = questionItem.querySelector('.btn-remove-question');
  removeButton.addEventListener('click', function() {
    questionItem.remove();
    updateQuestionNumbers(container);
  });
}

function updateQuestionNumbers(container) {
  const questions = container.querySelectorAll('.question-item');
  
  questions.forEach((question, index) => {
    const header = question.querySelector('h3');
    if (header) header.textContent = `Question ${index + 1}`;
    
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
    
    const removeButton = question.querySelector('.btn-remove-question');
    if (removeButton) removeButton.dataset.index = index;
  });
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

function initProfileForm() {
  // Mise en place du formulaire de profil
}

function initPasswordForm() {
  // Mise en place du formulaire de mot de passe
}

function initSearchForm() {
  // Mise en place du formulaire de recherche
}

// Fonctions utilitaires pour les formulaires
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}