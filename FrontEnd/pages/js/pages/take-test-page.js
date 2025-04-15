// js/pages/take-test-page.js
/**
 * Gestionnaire pour la page de test QCM
 */
import { auth } from '../utils/auth.js';
import { qcmService } from '../services/qcm-service.js';
import { sessionService } from '../services/session-service.js';
import { showNotification } from '../components/notification.js';

export async function initTakeTestPage() {
  console.log("Initialisation de la page de test...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = '../pages/login.html';
    return;
  }
  
  // Vérifier si un QCM spécifique est demandé via l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const qcmId = urlParams.get('qcmId');
  
  if (qcmId) {
    await loadAndStartTest(qcmId);
  } else {
    await loadQcmSelection();
  }
}

async function loadQcmSelection() {
  const selectionContainer = document.getElementById('qcm-selection');
  if (!selectionContainer) return;
  
  try {
    // Afficher un indicateur de chargement
    selectionContainer.innerHTML = '<div class="loading-spinner">Chargement des QCM...</div>';
    
    // Charger la liste des QCM disponibles
    const qcms = await qcmService.getAllQcms();
    
    if (qcms && qcms.length > 0) {
      selectionContainer.innerHTML = `
        <h2>Choisir un QCM</h2>
        <div class="qcm-list">
          ${qcms.map(qcm => `
            <div class="qcm-selection-item">
              <div class="qcm-info">
                <h3>${qcm.title}</h3>
                <p>${qcm.questions.length} questions - ${qcm.subject}</p>
              </div>
              <a href="../pages/take-test.html?qcmId=${qcm._id}" class="btn-primary">Commencer</a>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      selectionContainer.innerHTML = `
        <div class="empty-state">
          <h2>Aucun QCM disponible</h2>
          <p>Vous devez d'abord créer des QCM ou en générer à partir de vos documents.</p>
          <div class="empty-state-actions">
            <a href="../pages/create-qcm.html" class="btn-primary">Créer un QCM</a>
            <a href="../pages/upload-document.html" class="btn-secondary">Charger un document</a>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erreur:', error);
    selectionContainer.innerHTML = `
      <div class="error-state">
        <h2>Erreur de chargement</h2>
        <p>Impossible de charger les QCM disponibles.</p>
        <button class="btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

async function loadAndStartTest(qcmId) {
  const testContainer = document.getElementById('test-container');
  if (!testContainer) return;
  
  try {
    // Afficher un indicateur de chargement
    testContainer.innerHTML = '<div class="loading-spinner">Chargement du test...</div>';
    
    // Charger le QCM
    const qcm = await qcmService.getQcmById(qcmId);
    
    if (qcm) {
      // Cacher le conteneur de sélection si présent
      const selectionContainer = document.getElementById('qcm-selection');
      if (selectionContainer) selectionContainer.style.display = 'none';
      
      // Préparer l'interface du test
      setupTestInterface(qcm);
    } else {
      testContainer.innerHTML = `
        <div class="error-state">
          <h2>QCM introuvable</h2>
          <p>Impossible de charger ce QCM.</p>
          <a href="../pages/take-test.html" class="btn-primary">Choisir un autre QCM</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erreur:', error);
    testContainer.innerHTML = `
      <div class="error-state">
        <h2>Erreur de chargement</h2>
        <p>Impossible de charger ce QCM.</p>
        <a href="../pages/take-test.html" class="btn-primary">Choisir un autre QCM</a>
      </div>
    `;
  }
}

function setupTestInterface(qcm) {
  const testContainer = document.getElementById('test-container');
  
  // Variables pour suivre l'état du test
  let currentQuestionIndex = 0;
  let userAnswers = Array(qcm.questions.length).fill(null);
  let startTime = new Date();
  
  // Construire l'interface
  testContainer.innerHTML = `
    <div class="test-header">
      <h2>${qcm.title}</h2>
      <div class="test-info">
        <span>${qcm.questions.length} questions | ${qcm.subject}</span>
      </div>
    </div>
    
    <div class="test-progress">
      <div class="progress-bar">
        <div class="progress-indicator" style="width: 0%"></div>
      </div>
      <div class="progress-text">Question 1/${qcm.questions.length}</div>
    </div>
    
    <div class="question-container">
      <!-- La question sera affichée ici -->
    </div>
    
    <div class="test-navigation">
      <button id="prev-btn" class="btn-secondary" disabled>Question précédente</button>
      <button id="next-btn" class="btn-primary">Question suivante</button>
      <button id="finish-btn" class="btn-primary" style="display: none;">Terminer le test</button>
    </div>
  `;
  
  // Récupérer des références aux éléments
  const questionContainer = testContainer.querySelector('.question-container');
  const progressIndicator = testContainer.querySelector('.progress-indicator');
  const progressText = testContainer.querySelector('.progress-text');
  const prevButton = document.getElementById('prev-btn');
  const nextButton = document.getElementById('next-btn');
  const finishButton = document.getElementById('finish-btn');
  
  // Fonction pour afficher une question
  function displayQuestion(index) {
    const question = qcm.questions[index];
    
    questionContainer.innerHTML = `
      <div class="question">
        <h3>Question ${index + 1}</h3>
        <p class="question-text">${question.question}</p>
        
        <div class="choices">
          ${question.choices.map((choice, choiceIndex) => `
            <div class="choice">
              <input type="radio" id="choice-${choiceIndex}" name="question-${index}" value="${choiceIndex}" ${userAnswers[index] === choiceIndex ? 'checked' : ''}>
              <label for="choice-${choiceIndex}">${choice}</label>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Mettre à jour la barre de progression
    progressIndicator.style.width = `${((index + 1) / qcm.questions.length) * 100}%`;
    progressText.textContent = `Question ${index + 1}/${qcm.questions.length}`;
    
    // Mettre à jour les boutons de navigation
    prevButton.disabled = index === 0;
    nextButton.style.display = index < qcm.questions.length - 1 ? 'inline-block' : 'none';
    finishButton.style.display = index === qcm.questions.length - 1 ? 'inline-block' : 'none';
    
    // Ajouter des écouteurs pour les boutons radio
    const choiceInputs = questionContainer.querySelectorAll('input[type="radio"]');
    choiceInputs.forEach(input => {
      input.addEventListener('change', () => {
        userAnswers[index] = parseInt(input.value);
      });
    });
  }
  
  // Afficher la première question
  displayQuestion(currentQuestionIndex);
  
  // Ajouter des écouteurs pour les boutons de navigation
  prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      displayQuestion(currentQuestionIndex);
    }
  });
  
  nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < qcm.questions.length - 1) {
      currentQuestionIndex++;
      displayQuestion(currentQuestionIndex);
    }
  });
  
  finishButton.addEventListener('click', () => {
    // Vérifier si des questions restent sans réponse
    const unansweredCount = userAnswers.filter(answer => answer === null).length;
    
    if (unansweredCount > 0) {
      if (!confirm(`Vous n'avez pas répondu à ${unansweredCount} question(s). Voulez-vous quand même terminer?`)) {
        return;
      }
    }
    
    finishTest();
  });
  
  async function finishTest() {
    try {
      // Calculer le score
      let correctCount = 0;
      const questionsAnswered = [];
      
      qcm.questions.forEach((question, index) => {
        const userAnswerIndex = userAnswers[index];
        const userAnswer = userAnswerIndex !== null ? question.choices[userAnswerIndex] : null;
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correctCount++;
        
        questionsAnswered.push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect
        });
      });
      
      const score = Math.round((correctCount / qcm.questions.length) * 100);
      
      // Calculer la durée
      const endTime = new Date();
      const durationInSeconds = Math.floor((endTime - startTime) / 1000);
      
      // Créer la session
      const sessionData = {
        qcmId: qcm._id,
        score,
        questionsAnswered,
        duration: durationInSeconds
      };
      
      // Envoyer la session au serveur
      const session = await sessionService.createSession(sessionData);
      
      // Rediriger vers la page de résultats
      window.location.href = `../pages/results.html?sessionId=${session._id}`;
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de l\'enregistrement des résultats', 'error');
    }
  }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initTakeTestPage);