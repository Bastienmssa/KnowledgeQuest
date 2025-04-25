// js/pages/create-qcm-page.js
<<<<<<< HEAD
import { auth } from '../utils/auth.js';
=======
import auth from '../utils/auth.js';
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
import { qcmService } from '../services/qcm-service.js';
import { subjectService } from '../services/subject-service.js';
import { showNotification } from '../components/notification.js';

<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', initCreateQcmPage);

async function initCreateQcmPage() {
=======
// Indicateur d'initialisation
let pageInitialized = false;

// Exporter la fonction d'initialisation (un seul export)
export function initCreateQcmPage() {
  if (pageInitialized) {
    console.log("📝 Page création QCM déjà initialisée");
    return;
  }
  
  console.log("📝 Initialisation page création QCM");
  
  // Vérifier l'authentification
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  setupCreateQcmForm();
  setupCreateSubjectForm();
<<<<<<< HEAD
  await loadSubjects();

  const urlParams = new URLSearchParams(window.location.search);
  const editQcmId = urlParams.get('edit');
  const documentId = urlParams.get('document');

  if (editQcmId) await loadExistingQcm(editQcmId);
  else if (documentId) await prepopulateFromDocument(documentId);
=======
  loadSubjects().then(() => {
    // Traitement des paramètres d'URL
    const urlParams = new URLSearchParams(window.location.search);
    const editQcmId = urlParams.get('edit');
    const documentId = urlParams.get('document');

    if (editQcmId) loadExistingQcm(editQcmId);
    else if (documentId) prepopulateFromDocument(documentId);
  });
  
  pageInitialized = true;
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
}

async function loadSubjects() {
  const user = auth.user;
<<<<<<< HEAD
  console.log("🌍 Domaine utilisateur :", user?.domain);
=======
  if (!user?.domain) {
    console.error("❌ Domaine utilisateur non disponible");
    return;
  }
  
  console.log("🔍 Chargement des matières pour le domaine:", user.domain);
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d

  try {
    const subjectSelect = document.getElementById('qcm-subject');
    const topicSelect = document.getElementById('qcm-topic');

<<<<<<< HEAD
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
=======
    if (!subjectSelect || !topicSelect) {
      console.error("❌ Éléments select non trouvés dans le DOM");
      return;
    }

    // Désactiver et afficher chargement
    subjectSelect.disabled = true;
    subjectSelect.innerHTML = '<option value="" disabled selected>Chargement des matières...</option>';

    // Charger les matières depuis l'API
    const subjects = await subjectService.getSubjectsByDomain(user.domain);
    console.log(`✅ ${subjects.length} matières chargées`);

    // Vider le select
    subjectSelect.innerHTML = '';
    
    // Option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Choisissez une matière";
    subjectSelect.appendChild(defaultOption);
    
    // Ajouter les options de matières
    subjects.forEach(sub => {
      const option = document.createElement('option');
      option.value = sub.name;
      option.textContent = sub.name;
      subjectSelect.appendChild(option);
    });

    // Réactiver le select
    subjectSelect.disabled = false;

    // Supprimer les écouteurs existants pour éviter les doublons
    const clonedSelect = subjectSelect.cloneNode(true);
    subjectSelect.parentNode.replaceChild(clonedSelect, subjectSelect);
    
    // Ajouter l'écouteur d'événement
    clonedSelect.addEventListener('change', handleSubjectChange);
  } catch (error) {
    console.error('❌ Erreur chargement matières:', error);
    
    const subjectSelect = document.getElementById('qcm-subject');
    if (subjectSelect) {
      subjectSelect.innerHTML = '<option value="" disabled selected>Erreur de chargement</option>';
      subjectSelect.disabled = true;
    }
    
    showNotification('Impossible de charger les matières. Veuillez réessayer.', 'error');
  }
}

// Gestionnaire d'événement pour le changement de matière
async function handleSubjectChange(e) {
  const selectedSubject = e.target.value;
  const topicSelect = document.getElementById('qcm-topic');
  
  if (!topicSelect) return;
  
  topicSelect.disabled = true;
  topicSelect.innerHTML = '<option value="" disabled selected>Chargement des thèmes...</option>';

  try {
    console.log(`🔍 Chargement des thèmes pour: ${selectedSubject}`);
    const subject = await subjectService.getSubjectByName(selectedSubject);
    
    // Vider le select
    topicSelect.innerHTML = '';
    
    // Option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Choisissez un thème";
    topicSelect.appendChild(defaultOption);
    
    // Ajouter les options de thèmes s'il y en a
    if (subject && Array.isArray(subject.topics) && subject.topics.length > 0) {
      subject.topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        topicSelect.appendChild(option);
      });
      topicSelect.disabled = false;
    } else {
      const noTopicsOption = document.createElement('option');
      noTopicsOption.value = "";
      noTopicsOption.disabled = true;
      noTopicsOption.textContent = "Aucun thème disponible";
      topicSelect.appendChild(noTopicsOption);
    }
  } catch (error) {
    console.error('❌ Erreur chargement thèmes:', error);
    topicSelect.innerHTML = '<option value="" disabled selected>Erreur de chargement</option>';
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  }
}

function setupCreateSubjectForm() {
  const submitBtn = document.getElementById('submit-subject-btn');
  const nameInput = document.getElementById('new-subject-name');
  const topicsInput = document.getElementById('new-subject-topics');

<<<<<<< HEAD
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
=======
  if (!submitBtn || !nameInput || !topicsInput) {
    console.error("❌ Éléments du formulaire de création de matière non trouvés");
    return;
  }

  // Supprimer les écouteurs existants
  submitBtn.removeEventListener('click', handleCreateSubject);
  
  // Ajouter le nouvel écouteur
  submitBtn.addEventListener('click', handleCreateSubject);
}

// Gestionnaire d'événement pour la création de matière
async function handleCreateSubject() {
  const nameInput = document.getElementById('new-subject-name');
  const topicsInput = document.getElementById('new-subject-topics');
  
  const name = nameInput.value.trim();
  const topicsRaw = topicsInput.value.trim();
  const topics = topicsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const user = auth.user;

  if (!name) {
    showNotification("Veuillez saisir un nom de matière", "error");
    return;
  }

  if (!topics.length) {
    showNotification("Veuillez saisir au moins un thème", "error");
    return;
  }

  try {
    console.log(`📝 Création d'une nouvelle matière: ${name}`);
    await subjectService.createSubject({
      name,
      domain: user.domain,
      topics
    });

    showNotification('Matière créée avec succès !', 'success');
    
    // Réinitialiser les champs
    nameInput.value = '';
    topicsInput.value = '';

    // Recharger les matières et sélectionner la nouvelle
    await loadSubjects();
    
    // Sélectionner la nouvelle matière
    setTimeout(() => {
      const subjectSelect = document.getElementById('qcm-subject');
      if (subjectSelect) {
        subjectSelect.value = name;
        // Déclencher manuellement l'événement change
        subjectSelect.dispatchEvent(new Event('change'));
      }
    }, 100);
  } catch (err) {
    console.error('❌ Erreur création matière:', err);
    showNotification(err.message || 'Erreur lors de la création de la matière', 'error');
  }
}

function setupCreateQcmForm() {
  const form = document.getElementById('create-qcm-form');
  const addBtn = document.getElementById('add-question-btn');
  const container = document.getElementById('questions-container');

  if (!form || !addBtn || !container) {
    console.error("❌ Éléments du formulaire QCM non trouvés");
    return;
  }

  // Supprimer les écouteurs existants
  addBtn.removeEventListener('click', () => addQuestionToForm(container));
  form.removeEventListener('submit', handleFormSubmit);
  
  // Ajouter les nouveaux écouteurs
  addBtn.addEventListener('click', () => addQuestionToForm(container));
  form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  await handleFormSubmission(this);
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
}

async function handleFormSubmission(form) {
  try {
    const formData = new FormData(form);
    const user = auth.user;

    const qcmData = {
      title: formData.get('title'),
      subject: formData.get('subject'),
      topic: formData.get('topic'),
<<<<<<< HEAD
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
=======
      domain: user.domain,
      questions: []
    };

    if (!qcmData.title || !qcmData.subject || !qcmData.topic) {
      showNotification("Veuillez remplir tous les champs obligatoires", "error");
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
      return;
    }

    const questionElems = form.querySelectorAll('.question-item');
<<<<<<< HEAD
=======
    
    if (questionElems.length === 0) {
      showNotification("Veuillez ajouter au moins une question", "error");
      return;
    }

>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
    questionElems.forEach((el, i) => {
      const question = formData.get(`questions[${i}][question]`);
      const correctIndex = formData.get(`questions[${i}][correctAnswer]`);
      const choices = [0, 1, 2, 3].map(j => formData.get(`questions[${i}][choices][${j}]`));
<<<<<<< HEAD
=======
      
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
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
<<<<<<< HEAD
=======
    
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
    setTimeout(() => {
      window.location.href = `take-test.html?qcmId=${response._id}`;
    }, 1000);
  } catch (error) {
<<<<<<< HEAD
    console.error(error);
=======
    console.error("❌ Erreur soumission formulaire:", error);
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
    showNotification(error.message || 'Erreur lors de la sauvegarde du QCM', 'error');
  }
}

async function loadExistingQcm(qcmId) {
  try {
<<<<<<< HEAD
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
=======
    console.log(`🔍 Chargement du QCM: ${qcmId}`);
    const qcm = await qcmService.getQcmById(qcmId);
    
    if (!qcm) {
      showNotification('QCM introuvable', 'error');
      return;
    }

    // Mettre à jour le titre de la page
    const title = document.querySelector('h1');
    if (title) title.textContent = 'Modifier le QCM';
    
    // Remplir les champs
    document.getElementById('qcm-title').value = qcm.title;
    
    // Attendre que les matières soient chargées
    const waitForSubjects = setInterval(() => {
      const subjectSelect = document.getElementById('qcm-subject');
      if (subjectSelect && !subjectSelect.disabled) {
        clearInterval(waitForSubjects);
        
        // Sélectionner la matière
        subjectSelect.value = qcm.subject;
        subjectSelect.dispatchEvent(new Event('change'));
        
        // Attendre que les thèmes soient chargés
        const waitForTopics = setInterval(() => {
          const topicSelect = document.getElementById('qcm-topic');
          if (topicSelect && !topicSelect.disabled) {
            clearInterval(waitForTopics);
            topicSelect.value = qcm.topic;
            
            // Ajouter les questions
            const container = document.getElementById('questions-container');
            container.innerHTML = '';
            qcm.questions.forEach(q => addQuestionToForm(container, q));
            
            // Marquer comme édition
            document.getElementById('create-qcm-form').setAttribute('data-qcm-id', qcmId);
          }
        }, 100);
      }
    }, 100);
  } catch (error) {
    console.error('❌ Erreur chargement QCM:', error);
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
    showNotification('Erreur lors du chargement du QCM', 'error');
  }
}

async function prepopulateFromDocument(documentId) {
<<<<<<< HEAD
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
=======
  console.log(`🔍 Préremplissage depuis document: ${documentId}`);
  // Implémentation à venir
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
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
<<<<<<< HEAD
=======
  
  // Ajouter écouteur pour supprimer la question
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
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
<<<<<<< HEAD
export { initCreateQcmPage }; 
=======

// PAS de double export ici - supprimé
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
