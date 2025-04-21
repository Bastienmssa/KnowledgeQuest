// js/pages/stats-page.js
import { auth } from '../utils/auth.js';
import { statsService } from '../services/stats-service.js';
import { showNotification } from '../components/notification.js';
import { initCharts, updateCharts } from '../utils/charts.js';

export async function initStatsPage() {
  console.log("📊 Initialisation de la page de statistiques...");

  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const stats = await statsService.getUserStats();

    if (stats && stats.scoresHistory?.length > 0) {
      displayStats(stats);
      initCharts(stats);
    } else {
      displayEmptyState();
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des statistiques:', error);
    showNotification('Erreur lors du chargement des statistiques', 'error');
  }
}

function displayStats(stats) {
  const container = document.querySelector('.stats-container');
  if (!container) return;

  const sessionCount = stats.scoresHistory?.length || 0;
  const averageScore = stats.averageScore || 0;

  const scores = stats.scoresHistory.map(s => s.score);
  const highestScore = Math.max(...scores, 0);
  const lowestScore = Math.min(...scores, 100);

  container.innerHTML = `
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
        <h3>Répartition par matière</h3>
        <canvas id="distribution-chart"></canvas>
      </div>
    </div>

    <div class="recent-sessions">
      <h3>Sessions récentes</h3>
      ${renderSessionsTable(stats.scoresHistory)}
    </div>
  `;

  document.getElementById('time-filter')?.addEventListener('change', (e) => {
    updateCharts(stats, e.target.value);
  });
}

function renderSessionsTable(sessions) {
  if (!sessions || sessions.length === 0) {
    return '<p>Aucune session récente</p>';
  }

  const lastSessions = sessions.slice().reverse().slice(0, 5);

  return `
    <table class="sessions-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Score</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${lastSessions.map(s => `
          <tr>
            <td>${new Date(s.date).toLocaleDateString()}</td>
            <td class="score ${getScoreClass(s.score)}">${s.score}%</td>
            <td><a href="results.html?sessionId=${s._id}" class="btn-small">Voir</a></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function displayEmptyState() {
  const container = document.querySelector('.stats-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <h2>Aucune statistique disponible</h2>
      <p>Commencez à passer des tests pour voir vos progrès.</p>
      <a href="take-test.html" class="btn-primary">Commencer un test</a>
    </div>
  `;
}

function getScoreClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
}

document.addEventListener('DOMContentLoaded', initStatsPage);
