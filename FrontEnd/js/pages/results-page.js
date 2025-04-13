// js/pages/results-page.js
/**
 * Gestionnaire pour la page de résultats
 */
import { auth } from '../utils/auth.js';
import { sessionService } from '../services/session-service.js';
import { showNotification } from '../components/notification.js';

export async function initResultsPage() {
  console.log("Initialisation de la page de résultats...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = '../pages/login.html';
    return;
  }
  
  // Vérifier si une session spécifique est demandée via l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  
  if (sessionId) {
    await loadSessionResults(sessionId);
  } else {
    displayEmptyState();
  }
}

async function loadSessionResults(sessionId) {
  const resultsContainer = document.getElementById('results-container');
  if (!resultsContainer) return;
  
  try {
    // Afficher un indicateur de chargement
    resultsContainer.innerHTML = '<div class="loading-spinner">Chargement des résultats...</div>';
    
    // Charger les détails de la session
    const session = await sessionService.getSessionById(sessionId);
    
    if (session) {
      displayResults(session);
    } else {
      resultsContainer.innerHTML = `
        <div class="error-state">
          <h2>Session introuvable</h2>
          <p>Impossible de charger cette session de test.</p>
          <a href="../pages/dashboard.html" class="btn-primary">Retour au tableau de bord</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erreur:', error);
    resultsContainer.innerHTML = `
      <div class="error-state">
        <h2>Erreur de chargement</h2>
        <p>Impossible de charger les résultats de cette session.</p>
        <a href="../pages/dashboard.html" class="btn-primary">Retour au tableau de bord</a>
      </div>
    `;
  }
}

function displayResults(session) {
  const resultsContainer = document.getElementById('results-container');
  
  // Calculer les statistiques
  const totalQuestions = session.questionsAnswered.length;
  const correctAnswers = session.questionsAnswered.filter(q => q.isCorrect).length;
  
  resultsContainer.innerHTML = `
    <div class="results-header">
      <h2>Résultats du test</h2>
      <div class="session-date">
        Session du ${new Date(session.createdAt).toLocaleDateString()} à ${new Date(session.createdAt).toLocaleTimeString()}
      </div>
    </div>
    
    <div class="score-summary">
      <div class="score-card ${getScoreClass(session.score)}">
        <div class="score">${session.score}%</div>
        <div class="score-label">${getScoreLabel(session.score)}</div>
      </div>
      
      <div class="score-details">
        <div class="detail-item">
          <span class="label">Questions correctes:</span>
          <span class="value">${correctAnswers}/${totalQuestions}</span>
        </div>
      </div>
    </div>
    
    <div class="question-review">
      <h3>Révision des questions</h3>
      
      ${session.questionsAnswered.map((item, index) => `
        <div class="question-item ${item.isCorrect ? 'correct' : 'incorrect'}">
          <div class="question-header">
            <span class="question-number">Question ${index + 1}</span>
            <span class="question-status">${item.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
          </div>
          
          <p class="question-text">${item.question}</p>
          
          <div class="answer-info">
            <p class="user-answer">Votre réponse: ${item.userAnswer || '<em>Aucune réponse</em>'}</p>
            ${!item.isCorrect ? `<p class="correct-answer">Réponse correcte: ${item.correctAnswer}</p>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="results-actions">
      <a href="../pages/take-test.html" class="btn-primary">Nouveau test</a>
      <a href="../pages/dashboard.html" class="btn-secondary">Retour au tableau de bord</a>
    </div>
  `;
}

function displayEmptyState() {
  const resultsContainer = document.getElementById('results-container');
  if (!resultsContainer) return;
  
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <h2>Aucun résultat à afficher</h2>
      <p>Veuillez compléter un test pour voir vos résultats.</p>
      <a href="../pages/take-test.html" class="btn-primary">Commencer un test</a>
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
  if (score >= 90) return 'Excellent!';
  if (score >= 80) return 'Très bien!';
  if (score >= 70) return 'Bien!';
  if (score >= 60) return 'Assez bien';
  if (score >= 50) return 'Moyen';
  return 'À améliorer';
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initResultsPage);