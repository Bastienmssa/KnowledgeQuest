// js/pages/take-test-page.js
/**
 * Gestionnaire pour la page de test QCM
 */
import { auth } from '../utils/auth.js';
import { qcmService } from '../services/qcm-service.js';
import { sessionService } from '../services/session-service.js';
import { showNotification } from '../components/notification.js';

export async function initTakeTestPage() {
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const qcmId = urlParams.get('qcmId');

  if (qcmId) {
    await loadAndStartTest(qcmId);
  } else {
    await loadQcmSelection();
  }
}

async function loadQcmSelection() {
  const container = document.getElementById('qcm-selection');
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner">Chargement des QCM...</div>`;

  try {
    const qcms = await qcmService.getAllQcms();

    container.innerHTML = `
      <h2>Choisissez un QCM</h2>
      <div class="qcm-list">
        ${qcms.map(qcm => `
          <div class="qcm-selection-item">
            <div class="qcm-info">
              <h3>${qcm.title}</h3>
              <p>${qcm.questions.length} questions – ${qcm.subject}</p>
            </div>
            <a href="take-test.html?qcmId=${qcm._id}" class="btn-primary">Commencer</a>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="error-state">
        <h2>Erreur</h2>
        <p>Impossible de charger les QCM. Réessayez.</p>
        <button class="btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

async function loadAndStartTest(qcmId) {
  const container = document.getElementById('test-container');
  const selection = document.getElementById('qcm-selection');
  if (selection) selection.remove();

  container.innerHTML = `<div class="loading-spinner">Chargement du test...</div>`;

  try {
    const qcm = await qcmService.getQcmById(qcmId);
    if (!qcm) throw new Error("QCM introuvable");

    startTest(qcm, container);
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="error-state">
        <h2>Erreur</h2>
        <p>QCM non disponible.</p>
        <a href="take-test.html" class="btn-primary">Retour</a>
      </div>
    `;
  }
}

function startTest(qcm, container) {
  let currentIndex = 0;
  const userAnswers = Array(qcm.questions.length).fill(null);
  const startTime = new Date();

  // Timer affiché en haut
  let timerInterval;
  const timerEl = document.createElement('div');
  timerEl.className = 'test-timer';
  timerEl.textContent = '⏱ Temps écoulé : 00:00';
  container.prepend(timerEl);

  function updateTimer() {
    const now = new Date();
    const seconds = Math.floor((now - startTime) / 1000);
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `⏱ Temps écoulé : ${min}:${sec}`;
  }

  timerInterval = setInterval(updateTimer, 1000);

  container.innerHTML = `
    <div class="test-header">
      <h2>${qcm.title}</h2>
      <p>${qcm.subject} – ${qcm.questions.length} questions</p>
    </div>
    <div class="test-progress">
      <div class="progress-bar"><div class="progress-indicator"></div></div>
      <div class="progress-text"></div>
    </div>
    <div class="question-container"></div>
    <div class="test-navigation">
      <button id="prev-btn" class="btn-secondary">Précédent</button>
      <button id="next-btn" class="btn-primary">Suivant</button>
      <button id="finish-btn" class="btn-primary" style="display: none;">Terminer</button>
    </div>
  `;

  const questionEl = container.querySelector('.question-container');
  const progressText = container.querySelector('.progress-text');
  const progressBar = container.querySelector('.progress-indicator');
  const prevBtn = container.querySelector('#prev-btn');
  const nextBtn = container.querySelector('#next-btn');
  const finishBtn = container.querySelector('#finish-btn');

  function renderQuestion(index) {
    const question = qcm.questions[index];
    questionEl.innerHTML = `
      <div class="question">
        <h3>Question ${index + 1}</h3>
        <p>${question.question}</p>
        <div class="choices">
          ${question.choices.map((choice, i) => `
            <label class="choice">
              <input type="radio" name="q-${index}" value="${i}" ${userAnswers[index] === i ? 'checked' : ''}>
              ${choice}
            </label>
          `).join('')}
        </div>
      </div>
    `;

    progressText.textContent = `Question ${index + 1} / ${qcm.questions.length}`;
    progressBar.style.width = `${((index + 1) / qcm.questions.length) * 100}%`;

    prevBtn.disabled = index === 0;
    nextBtn.style.display = index < qcm.questions.length - 1 ? 'inline-block' : 'none';
    finishBtn.style.display = index === qcm.questions.length - 1 ? 'inline-block' : 'none';

    questionEl.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        userAnswers[index] = parseInt(input.value);

        // Mode révision : afficher la correction immédiate
        const isCorrect = question.choices[parseInt(input.value)] === question.correctAnswer;
        if (!isCorrect) {
          showNotification(`❌ Mauvaise réponse. La bonne réponse est : "${question.correctAnswer}"`, 'warning');
        }
        saveProgress(); // sauvegarde auto
      });
    });
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion(currentIndex);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < qcm.questions.length - 1) {
      currentIndex++;
      renderQuestion(currentIndex);
    }
  });

  finishBtn.addEventListener('click', () => {
    const unanswered = userAnswers.filter(v => v === null).length;
    if (unanswered > 0 && !confirm(`Il reste ${unanswered} question(s) sans réponse. Continuer ?`)) return;
    finishTest();
  });

  function saveProgress() {
    const key = `qcm-progress-${qcm._id}`;
    localStorage.setItem(key, JSON.stringify({ userAnswers, currentIndex }));
  }

  function clearProgress() {
    localStorage.removeItem(`qcm-progress-${qcm._id}`);
  }

  async function finishTest() {
    clearInterval(timerInterval);
    clearProgress();

    const results = qcm.questions.map((q, i) => {
      const selected = userAnswers[i];
      return {
        question: q.question,
        userAnswer: selected !== null ? q.choices[selected] : null,
        correctAnswer: q.correctAnswer,
        isCorrect: q.choices[selected] === q.correctAnswer
      };
    });

    const score = Math.round(results.filter(r => r.isCorrect).length / qcm.questions.length * 100);
    const duration = Math.floor((new Date() - startTime) / 1000);

    try {
      const session = await sessionService.createSession({
        qcmId: qcm._id,
        score,
        duration,
        questionsAnswered: results
      });

      window.location.href = `results.html?sessionId=${session._id}`;
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de l'enregistrement", 'error');
    }
  }

  // Reprise automatique ?
  const saved = localStorage.getItem(`qcm-progress-${qcm._id}`);
  if (saved) {
    const restore = confirm("⚠️ Une tentative précédente de ce QCM a été trouvée. Reprendre ?");
    if (restore) {
      const data = JSON.parse(saved);
      Object.assign(userAnswers, data.userAnswers);
      currentIndex = data.currentIndex;
    } else {
      clearProgress();
    }
  }

  renderQuestion(currentIndex);
}

document.addEventListener('DOMContentLoaded', initTakeTestPage);
