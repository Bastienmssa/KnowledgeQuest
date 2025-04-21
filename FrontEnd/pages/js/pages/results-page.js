import { auth } from '../utils/auth.js';
import { sessionService } from '../services/session-service.js';
import { showNotification } from '../components/notification.js';

export async function initResultsPage() {
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');

  if (sessionId) {
    await loadSessionResults(sessionId);
  } else {
    displayEmptyState();
  }
}

async function loadSessionResults(sessionId) {
  const container = document.getElementById('results-container');
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner">Chargement des résultats...</div>`;

  try {
    const session = await sessionService.getSessionById(sessionId);

    if (!session || !session.questionsAnswered) {
      container.innerHTML = getErrorTemplate('Session introuvable', 'Aucune session ne correspond à cet identifiant.');
      return;
    }

    const correct = session.questionsAnswered.filter(q => q.isCorrect).length;
    const total = session.questionsAnswered.length;
    const score = session.score ?? 0;
    const duration = session.duration ?? 0;

    container.innerHTML = `
      <div class="results-header">
        <h2>Résultats du test</h2>
        <p class="session-date">Réalisé le ${new Date(session.createdAt).toLocaleDateString('fr-FR')}</p>
      </div>

      <div class="score-summary">
        <div class="score-card ${getScoreClass(score)}">
          <div class="score">${score}%</div>
          <div class="score-label">${getScoreLabel(score)}</div>
        </div>
        <div class="score-details">
          <p><strong>${correct}</strong> / ${total} bonnes réponses</p>
          <p>Durée : ${Math.floor(duration / 60)}min ${duration % 60}s</p>
        </div>
      </div>

      <div class="results-actions">
        <button class="btn-primary" id="btn-export-pdf">📄 Exporter PDF</button>
        <button class="btn-secondary" id="btn-share">🔗 Partager</button>
        <button class="btn-secondary" id="btn-errors-only">❌ Revoir erreurs</button>
        <a href="take-test.html" class="btn-primary">Nouveau test</a>
        <a href="dashboard.html" class="btn-secondary">Retour au tableau de bord</a>
      </div>

      <div class="question-review" id="question-review">
        <h3>Revue des questions</h3>
        ${session.questionsAnswered.map((q, i) => `
          <div class="question-item ${q.isCorrect ? 'correct' : 'incorrect'}" data-correct="${q.isCorrect}">
            <div class="question-header">
              <span>Question ${i + 1}</span>
              <span class="question-status">${q.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
            </div>
            <p class="question-text">${q.question || 'Question non disponible'}</p>
            <p class="user-answer">
              <strong>Votre réponse :</strong> 
              <span class="${q.isCorrect ? 'text-success' : 'text-danger'}">
                ${q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer !== ''
                  ? q.userAnswer
                  : '<em>Aucune</em>'}
              </span>
            </p>
            <p class="correct-answer">
              <strong>Bonne réponse :</strong> 
              <span class="text-success">${q.correctAnswer || 'Non définie'}</span>
            </p>
          </div>
        `).join('')}
      </div>
    `;

    // Boutons d'action
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => window.print());

    document.getElementById('btn-share')?.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showNotification("Lien copié dans le presse-papiers !", "success"));
    });

    document.getElementById('btn-errors-only')?.addEventListener('click', () => {
      document.querySelectorAll('.question-item').forEach(item => {
        item.style.display = item.dataset.correct === 'false' ? 'block' : 'none';
      });
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = getErrorTemplate('Erreur', 'Impossible de charger les résultats. Veuillez réessayer plus tard.');
  }
}

function displayEmptyState() {
  const container = document.getElementById('results-container');
  container.innerHTML = `
    <div class="empty-state">
      <h2>Aucun test sélectionné</h2>
      <p>Commencez un test pour voir vos résultats ici.</p>
      <a href="take-test.html" class="btn-primary">Passer un test</a>
    </div>
  `;
}

function getErrorTemplate(title, message) {
  return `
    <div class="error-state">
      <h2>${title}</h2>
      <p>${message}</p>
      <a href="dashboard.html" class="btn-secondary">Retour au tableau de bord</a>
    </div>
  `;
}

function getScoreClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
}

function getScoreLabel(score) {
  if (score >= 90) return 'Excellent !';
  if (score >= 80) return 'Très bien !';
  if (score >= 70) return 'Bien';
  if (score >= 60) return 'Correct';
  if (score >= 50) return 'Passable';
  return 'À améliorer';
}

document.addEventListener('DOMContentLoaded', initResultsPage);
