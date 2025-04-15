// js/pages/dashboard-page.js
/**
 * Gestionnaire pour la page du tableau de bord
 */
import { auth } from '../utils/auth.js';
import { qcmService } from '../services/qcm-service.js';
import { sessionService } from '../services/session-service.js';
import { statsService } from '../services/stats-service.js';
import { showNotification } from '../components/notification.js';

export async function initDashboardPage() {
  console.log("Initialisation du tableau de bord...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = '../pages/login.html';
    return;
  }
  
  try {
    // Personnaliser l'interface avec les données de l'utilisateur
    updateUserInfo();
    
    // Charger les données du tableau de bord en parallèle
    const [qcms, sessions, stats] = await Promise.all([
      qcmService.getAllQcms({ limit: 5 }),
      sessionService.getUserSessions(),
      statsService.getUserStats()
    ]);
    
    // Mettre à jour l'interface utilisateur avec les données récupérées
    displayRecentQCMs(qcms);
    displayRecentSessions(sessions);
    displayUserStats(stats);
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    showNotification('Erreur lors du chargement des données', 'error');
  }
}

function updateUserInfo() {
  const userNameElement = document.getElementById('user-name');
  const domainBadgeElement = document.querySelector('.domain-badge');
  
  if (userNameElement && auth.user) {
    userNameElement.textContent = auth.user.name || 'Utilisateur';
  }
  
  if (domainBadgeElement && auth.user) {
    domainBadgeElement.textContent = auth.user.domain || 'Domaine';
    domainBadgeElement.classList.remove('medicine', 'law');
    domainBadgeElement.classList.add(auth.user.domain === 'Médecine' ? 'medicine' : 'law');
  }
}

function displayRecentQCMs(qcms) {
  const container = document.getElementById('recent-qcms');
  if (!container) return;
  
  if (!qcms || qcms.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Aucun QCM disponible</p>
        <a href="../pages/create-qcm.html" class="btn-primary">Créer un QCM</a>
      </div>
    `;
    return;
  }
  
  let html = '<div class="qcm-cards">';
  qcms.forEach(qcm => {
    html += `
      <div class="qcm-card">
        <h3>${qcm.title}</h3>
        <p>${qcm.questions.length} questions</p>
        <div class="qcm-actions">
          <a href="../pages/take-test.html?qcmId=${qcm._id}" class="btn-primary">Réviser</a>
          <a href="../pages/create-qcm.html?edit=${qcm._id}" class="btn-secondary">Modifier</a>
        </div>
      </div>
    `;
  });
  html += '</div>';
  
  container.innerHTML = html;
}

function displayRecentSessions(sessions) {
  const container = document.getElementById('recent-sessions');
  if (!container) return;
  
  if (!sessions || sessions.length === 0) {
    container.innerHTML = '<p>Aucune session récente</p>';
    return;
  }
  
  let html = '<ul class="sessions-list">';
  sessions.forEach(session => {
    html += `
      <li class="session-item">
        <div class="session-info">
          <span class="session-date">${new Date(session.createdAt).toLocaleDateString()}</span>
          <span class="session-score">Score: ${session.score}%</span>
        </div>
        <a href="../pages/results.html?sessionId=${session._id}" class="btn-small">Voir</a>
      </li>
    `;
  });
  html += '</ul>';
  
  container.innerHTML = html;
}

function displayUserStats(stats) {
  const container = document.getElementById('user-stats');
  if (!container) return;
  
  if (!stats) {
    container.innerHTML = '<p>Aucune statistique disponible</p>';
    return;
  }
  
  container.innerHTML = `
    <div class="stats-summary">
      <div class="stat-card">
        <h3>Score moyen</h3>
        <p class="stat-value">${Math.round(stats.averageScore || 0)}%</p>
      </div>
      <div class="stat-card">
        <h3>Sessions complétées</h3>
        <p class="stat-value">${stats.scoresHistory?.length || 0}</p>
      </div>
    </div>
  `;
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initDashboardPage);