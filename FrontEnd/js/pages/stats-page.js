// js/pages/stats-page.js
/**
 * Gestionnaire pour la page de statistiques
 */
import { auth } from '../utils/auth.js';
import { statsService } from '../services/stats-service.js';
import { showNotification } from '../components/notification.js';

export async function initStatsPage() {
  console.log("Initialisation de la page de statistiques...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = '../pages/login.html';
    return;
  }
  
  try {
    // Charger les statistiques utilisateur
    const stats = await statsService.getUserStats();
    
    if (stats) {
      displayStats(stats);
      
      // Initialiser les graphiques si nécessaire
      if (window.initCharts) {
        window.initCharts(stats);
      }
    } else {
      displayEmptyState();
    }
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur lors du chargement des statistiques', 'error');
  }
}

function displayStats(stats) {
  const statsContainer = document.querySelector('.stats-container');
  if (!statsContainer) return;
  
  // Calculer les statistiques additionnelles
  const sessionCount = stats.scoresHistory?.length || 0;
  const averageScore = stats.averageScore || 0;
  
  // Trouver le score le plus élevé et le plus bas
  let highestScore = 0;
  let lowestScore = 100;
  
  if (stats.scoresHistory && stats.scoresHistory.length > 0) {
    stats.scoresHistory.forEach(item => {
      if (item.score > highestScore) highestScore = item.score;
      if (item.score < lowestScore) lowestScore = item.score;
    });
  } else {
    lowestScore = 0;
  }
  
  statsContainer.innerHTML = `
    <div class="stats-header">
      <h2>Vos statistiques</h2>
      <div class="stats-filters">
        <select id="time-filter">
          <option value="all">Toutes les périodes</option>
          <option value="month">Dernier mois</option>
          <option value="week">Dernière semaine</option>
        </select>
      </div>
    </div>
    
    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-value">${averageScore.toFixed(1)}%</div>
        <div class="stat-label">Score moyen</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${sessionCount}</div>
        <div class="stat-label">Tests complétés</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${highestScore}%</div>
        <div class="stat-label">Meilleur score</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${lowestScore}%</div>
        <div class="stat-label">Score le plus bas</div>
      </div>
    </div>
    
    <div class="stats-charts">
      <div class="chart-container">
        <h3>Évolution des scores</h3>
        <canvas id="scores-chart"></canvas>
      </div>
      
      <div class="chart-container">
        <h3>Répartition des scores</h3>
        <canvas id="distribution-chart"></canvas>
      </div>
    </div>
    
    <div class="recent-sessions">
      <h3>Sessions récentes</h3>
      ${stats.scoresHistory && stats.scoresHistory.length > 0 ? 
        `<table class="sessions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${stats.scoresHistory.slice().reverse().slice(0, 5).map(session => `
              <tr>
                <td>${new Date(session.date).toLocaleDateString()}</td>
                <td class="score ${getScoreClass(session.score)}">${session.score}%</td>
                <td>
                  <a href="../pages/results.html?sessionId=${session._id}" class="btn-small">Voir</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
        : '<p>Aucune session récente</p>'
      }
    </div>
  `;
  
  // Ajouter un écouteur pour le filtre de temps
  const timeFilter = document.getElementById('time-filter');
  if (timeFilter) {
    timeFilter.addEventListener('change', () => {
      // Cette fonction devrait filtrer les données affichées
      // et mettre à jour les graphiques
      if (window.updateCharts) {
        window.updateCharts(stats, timeFilter.value);
      }
    });
  }
}

function displayEmptyState() {
  const statsContainer = document.querySelector('.stats-container');
  if (!statsContainer) return;
  
  statsContainer.innerHTML = `
    <div class="empty-state">
      <h2>Aucune statistique disponible</h2>
      <p>Complétez des tests pour voir apparaître vos statistiques.</p>
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

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initStatsPage);