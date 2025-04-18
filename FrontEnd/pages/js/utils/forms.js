// js/utils/forms.js
/**
 * Module pour gérer les formulaires génériques dans l'application
 * Note: Les formulaires d'auth sont gérés par login-page.js et register-page.js
 */
import { qcmService } from '../services/qcm-service.js';
import { subjectService } from '../services/subject-service.js';
import { showNotification } from '../components/notification.js';

export function initForms() {
  console.log("Initialisation des formulaires génériques...");
  initCreateQcmForm();
  initSearchForm();
}

// Chargement dynamique des matières disponibles
async function loadDomains(selectElement) {
  if (!selectElement) return;

  try {
    const subjects = await subjectService.getAllSubjects();
    selectElement.innerHTML = '<option value="" disabled selected>Choisissez une matière</option>';
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject.name;
      option.textContent = subject.name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error('Erreur chargement matières:', error);
    selectElement.innerHTML += `
      <option value="Médecine">Médecine</option>
      <option value="Droit">Droit</option>
    `;
  }
}

function initCreateQcmForm() {
  const qcmForm = document.getElementById('create-qcm-form');
  if (!qcmForm) return;

  const subjectSelect = document.getElementById('qcm-subject');
  loadDomains(subjectSelect);

  const addQuestionBtn = document.getElementById('add-question-btn');
  const questionsContainer = document.getElementById('questions-container');

  if (addQuestionBtn && questionsContainer) {
    addQuestionBtn.addEventListener('click', () => {
      const questionCount = questionsContainer.querySelectorAll('.question-item').length;
      addNewQuestion(questionsContainer, questionCount);
    });

    if (questionsContainer.children.length === 0) {
      addQuestionBtn.click();
    }
  }

  qcmForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('qcm-title');
    const subject = document.getElementById('qcm-subject');

    if (!title.value) return showFormError(title, 'Titre requis');
    if (!subject.value) return showFormError(subject, 'Matière requise');

    const qcmData = {
      title: title.value,
      subject: subject.value,
      questions: []
    };

    const questions = document.querySelectorAll('.question-item');
    for (let index = 0; index < questions.length; index++) {
      const questionElem = questions[index];
      const questionText = questionElem.querySelector('textarea').value;
      const correctRadio = questionElem.querySelector('input[type="radio"]:checked');
      const choiceInputs = questionElem.querySelectorAll('input[type="text"]');

      if (!questionText || !correctRadio || [...choiceInputs].some(c => !c.value)) {
        showNotification('Veuillez compléter toutes les questions et réponses.', 'error');
        return;
      }

      const choices = [...choiceInputs].map(c => c.value);
      const correctAnswer = choices[parseInt(correctRadio.value)];

      qcmData.questions.push({ question: questionText, choices, correctAnswer });
    }

    try {
      const res = await qcmService.createQcm(qcmData);
      if (res && res.qcm && res.qcm._id) {
        window.location.href = `take-test.html?qcmId=${res.qcm._id}`;
      } else {
        showNotification('Erreur lors de la création du QCM', 'error');
      }
    } catch (err) {
      console.error('Erreur:', err);
      showNotification('Erreur serveur lors de la création du QCM', 'error');
    }
  });
}

function addNewQuestion(container, index) {
  const div = document.createElement('div');
  div.className = 'question-item';
  div.setAttribute('data-index', index);

  div.innerHTML = `
    <div class="question-header">
      <h3>Question ${index + 1}</h3>
      <button type="button" class="btn-remove-question">Supprimer</button>
    </div>
    <div class="form-group">
      <label for="question-${index}">Énoncé</label>
      <textarea id="question-${index}" name="questions[${index}][question]" required></textarea>
    </div>
    <div class="choices-container">
      ${[0,1,2,3].map(i => `
        <div class="form-group choice-item">
          <label>
            <input type="radio" name="questions[${index}][correctAnswer]" value="${i}" required>
            <input type="text" name="questions[${index}][choices][${i}]" placeholder="Réponse ${i + 1}" required>
          </label>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(div);

  const removeBtn = div.querySelector('.btn-remove-question');
  removeBtn.addEventListener('click', () => {
    div.remove();
    updateQuestionNumbers(container);
  });
}

function updateQuestionNumbers(container) {
  const questions = container.querySelectorAll('.question-item');
  questions.forEach((q, i) => {
    q.querySelector('h3').textContent = `Question ${i + 1}`;
    q.setAttribute('data-index', i);

    const textarea = q.querySelector('textarea');
    textarea.name = `questions[${i}][question]`;
    textarea.id = `question-${i}`;

    const radios = q.querySelectorAll('input[type="radio"]');
    const texts = q.querySelectorAll('input[type="text"]');

    radios.forEach((radio, j) => {
      radio.name = `questions[${i}][correctAnswer]`;
      texts[j].name = `questions[${i}][choices][${j}]`;
    });
  });
}

export function showFormError(inputElement, message) {
  if (!inputElement) return showNotification(message, 'error');

  const parent = inputElement.parentElement;
  parent.querySelector('.error-message')?.remove();
  inputElement.classList.add('input-error');

  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-message';
  errorMsg.textContent = message;
  parent.appendChild(errorMsg);

  inputElement.focus();
  inputElement.addEventListener('input', () => {
    inputElement.classList.remove('input-error');
    errorMsg.remove();
  }, { once: true });
}

function initSearchForm() {
  const searchForm = document.getElementById('search-form');
  if (!searchForm) return;

  console.log("Initialisation du formulaire de recherche...");
  // Implementation future
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export default {
  initForms,
  validateEmail,
  showFormError,
  loadDomains
};
