// js/pages/create-qcm-page.js
import { auth } from '../utils/auth.js';
import { qcmService } from '../services/qcm-service.js';
import { subjectService } from '../services/subject-service.js';
import { showNotification } from '../components/notification.js';

document.addEventListener('DOMContentLoaded', initCreateQcmPage);

async function initCreateQcmPage() {
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  setupCreateQcmForm();
  setupCreateSubjectForm();
  await loadSubjects();

  const urlParams = new URLSearchParams(window.location.search);
  const editQcmId = urlParams.get('edit');
  const documentId = urlParams.get('document');

  if (editQcmId) await loadExistingQcm(editQcmId);
  else if (documentId) await prepopulateFromDocument(documentId);
}

async function loadSubjects() {
  const user = auth.user;
  console.log("🌍 Domaine utilisateur :", user?.domain);

  try {
    const subjectSelect = document.getElementById('qcm-subject');
    const topicSelect = document.getElementById('qcm-topic');

    if (!subjectSelect || !topicSelect || !user?.domain) return;

    const subjects = await subjectService.getSubjectsByDomain(user.domain);

    subjectSelect.innerHTML = `<option value="" disabled selected>Choisissez une matière</option>`;
    subjects.forEach(sub => {
      subjectSelect.innerHTML += `<option value="${sub.name}">${sub.name}</option>`;
    });

    subjectSelect.addEventListener('change', async (e) => {
      const selectedSubject = e.target.value;
      topicSelect.disabled = true;
      topicSelect.innerHTML = `<option value="" disabled selected>Chargement des thèmes...</option>`;

      try {
        const subject = await subjectService.getSubjectByName(selectedSubject);
        if (!subject || !subject.topics?.length) {
          topicSelect.innerHTML = `<option value="" disabled>Aucun thème disponible</option>`;
          return;
        }

        topicSelect.disabled = false;
        topicSelect.innerHTML = `<option value="" disabled selected>Choisissez un thème</option>`;
        subject.topics.forEach(t => {
          topicSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
      } catch {
        topicSelect.innerHTML = `<option value="" disabled>Erreur de chargement</option>`;
      }
    });
  } catch (error) {
    console.error('Erreur chargement matières:', error);
    showNotification('Impossible de charger les matières disponibles.', 'error');
  }
}

function setupCreateSubjectForm() {
  const submitBtn = document.getElementById('submit-subject-btn');
  const nameInput = document.getElementById('new-subject-name');
  const topicsInput = document.getElementById('new-subject-topics');

  if (!submitBtn || !nameInput || !topicsInput) return;

  submitBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const topicsRaw = topicsInput.value.trim();
    const topics = topicsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const user = auth.user;

    if (!name || !topics.length) {
      showNotification("Veuillez renseigner un nom de matière et au moins un thème.", "error");
      return;
    }

    try {
      await subjectService.createSubject({
        name,
        domain: user.domain,
        topics
      });

      showNotification('Matière créée avec succès !', 'success');
      nameInput.value = '';
      topicsInput.value = '';

      await loadSubjects();
      const subjectSelect = document.getElementById('qcm-subject');
      subjectSelect.value = name;
      subjectSelect.dispatchEvent(new Event('change'));
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Erreur lors de la création de la matière', 'error');
    }
  });
}

async function handleFormSubmission(form) {
  try {
    const formData = new FormData(form);
    const user = auth.user;

    const qcmData = {
      title: formData.get('title'),
      subject: formData.get('subject'),
      topic: formData.get('topic'),
      domain: user.domain, // ✅ Ajout du champ `domain` attendu par le backend
      questions: []
    };

    if (!user || !user.domain) throw new Error("Utilisateur non authentifié");

    const allowedSubjects = await subjectService.getSubjectsByDomain(user.domain);
    const allowedNames = allowedSubjects.map(s => s.name);
    if (!allowedNames.includes(qcmData.subject)) {
      showNotification('La matière sélectionnée ne correspond pas à votre domaine', 'error');
      return;
    }

    if (!qcmData.topic) {
      showNotification("Veuillez sélectionner un thème", "error");
      return;
    }

    const questionElems = form.querySelectorAll('.question-item');
    questionElems.forEach((el, i) => {
      const question = formData.get(`questions[${i}][question]`);
      const correctIndex = formData.get(`questions[${i}][correctAnswer]`);
      const choices = [0, 1, 2, 3].map(j => formData.get(`questions[${i}][choices][${j}]`));
      qcmData.questions.push({
        question,
        choices,
        correctAnswer: choices[correctIndex]
      });
    });

    const qcmId = form.getAttribute('data-qcm-id');
    const response = qcmId
      ? await qcmService.updateQcm(qcmId, qcmData)
      : await qcmService.createQcm(qcmData);

    showNotification('QCM enregistré avec succès !', 'success');
    setTimeout(() => {
      window.location.href = `take-test.html?qcmId=${response._id}`;
    }, 1000);
  } catch (error) {
    console.error(error);
    showNotification(error.message || 'Erreur lors de la sauvegarde du QCM', 'error');
  }
}

async function loadExistingQcm(qcmId) {
  try {
    const qcm = await qcmService.getQcmById(qcmId);
    if (!qcm) throw new Error('QCM introuvable');

    document.querySelector('h1').textContent = 'Modifier le QCM';
    document.getElementById('qcm-title').value = qcm.title;
    document.getElementById('qcm-subject').value = qcm.subject;

    const topicSelect = document.getElementById('qcm-topic');
    topicSelect.innerHTML = `<option value="${qcm.topic}" selected>${qcm.topic}</option>`;
    topicSelect.disabled = false;

    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    qcm.questions.forEach(q => addQuestionToForm(container, q));

    document.getElementById('create-qcm-form').setAttribute('data-qcm-id', qcmId);
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur lors du chargement du QCM', 'error');
  }
}

async function prepopulateFromDocument(documentId) {
  console.log("Préremplissage à partir du document :", documentId);
}

function setupCreateQcmForm() {
  const form = document.getElementById('create-qcm-form');
  const addBtn = document.getElementById('add-question-btn');
  const container = document.getElementById('questions-container');

  addBtn.addEventListener('click', () => addQuestionToForm(container));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmission(form);
  });
}

function addQuestionToForm(container, data = null) {
  const index = container.children.length;
  const el = document.createElement('div');
  el.className = 'question-item';
  el.dataset.index = index;

  el.innerHTML = `
    <div class="question-header">
      <h3>Question ${index + 1}</h3>
      <button type="button" class="btn-remove-question">Supprimer</button>
    </div>
    <div class="form-group">
      <label>Énoncé</label>
      <textarea name="questions[${index}][question]" required>${data?.question || ''}</textarea>
    </div>
    <div class="choices-container">
      ${[0, 1, 2, 3].map(i => `
        <div class="form-group">
          <label>Choix ${i + 1}</label>
          <input type="text" name="questions[${index}][choices][${i}]" value="${data?.choices?.[i] || ''}" required>
        </div>
      `).join('')}
    </div>
    <div class="form-group">
      <label>Réponse correcte</label>
      <div class="correct-answer-selector">
        ${[0, 1, 2, 3].map(i => `
          <label>
            <input type="radio" name="questions[${index}][correctAnswer]" value="${i}" ${data?.correctAnswer === data?.choices?.[i] ? 'checked' : ''} required>
            Choix ${i + 1}
          </label>
        `).join('')}
      </div>
    </div>
  `;

  container.appendChild(el);
  el.querySelector('.btn-remove-question').addEventListener('click', () => {
    container.removeChild(el);
    updateQuestionIndices(container);
  });
}

function updateQuestionIndices(container) {
  const items = container.querySelectorAll('.question-item');
  items.forEach((item, index) => {
    item.dataset.index = index;
    item.querySelector('h3').textContent = `Question ${index + 1}`;
  });
}
export { initCreateQcmPage }; 