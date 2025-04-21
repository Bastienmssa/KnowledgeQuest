// js/pages/dashboard-page.js

import { auth } from '../utils/auth.js';
import { qcmService } from '../services/qcm-service.js';
import { statsService } from '../services/stats-service.js';
import { showNotification } from '../components/notification.js';

export async function initDashboardPage() {
  console.log("📊 Initialisation du tableau de bord...");

  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const user = auth.user;
  document.getElementById('dashboard-user-name').textContent = user.name.split(' ')[0];

  try {
    const [stats, qcms] = await Promise.all([
      statsService.getUserStats(),
      qcmService.getAllQcms()
    ]);

    const userQcms = qcms.filter(qcm => qcm.createdBy === user.id);

    displayStats(stats, userQcms.length);
    displayMiniChart(stats);
    displayRecentActivity(stats.scoresHistory);
    displayRecentQcms(userQcms);
  } catch (error) {
    console.error('❌ Erreur dans le tableau de bord :', error);
    showNotification("Erreur lors du chargement du tableau de bord", "error");
  }
}

function displayStats(stats, qcmCount) {
  document.getElementById('average-score').textContent = `${Math.round(stats.averageScore || 0)}%`;
  document.getElementById('qcms-created').textContent = qcmCount ?? '0';
  document.getElementById('tests-completed').textContent = stats.scoresHistory?.length ?? '0';
}

function displayMiniChart(stats) {
  const canvas = document.getElementById('mini-progress-chart');
  if (!canvas) return;

  const data = statsService.getLastMonthScores(stats);

  ensureChartJsLoaded().then(() => {
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Progression',
          data: data.data,
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => `${context.parsed.y} %`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Score (%)' }
          },
          x: {
            title: { display: true, text: 'Date' }
          }
        }
      }
    });
  });
}

function ensureChartJsLoaded() {
  if (window.Chart) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function displayRecentActivity(sessions) {
  const container = document.getElementById('recent-activity');
  if (!container) return;

  if (!sessions || sessions.length === 0) {
    container.innerHTML = '<p>Aucune activité récente.</p>';
    return;
  }

  const recent = sessions.slice().reverse().slice(0, 5);
  container.innerHTML = recent.map(session => `
    <div class="activity-item">
      <p>${new Date(session.date).toLocaleDateString('fr-FR')} - Score : ${session.score}%</p>
      <a href="results.html?sessionId=${session._id}" class="btn-small">Voir</a>
    </div>
  `).join('');
}

function displayRecentQcms(qcms) {
  const container = document.getElementById('recent-qcms');
  if (!container) return;

  if (!qcms || qcms.length === 0) {
    container.innerHTML = '<p>Aucun QCM récent.</p>';
    return;
  }

  const recent = qcms.slice(0, 5);
  container.innerHTML = recent.map(qcm => `
    <div class="qcm-card">
      <h3>${qcm.title}</h3>
      <p>${qcm.questions.length} questions</p>
      <div class="qcm-actions">
        <a href="take-test.html?qcmId=${qcm._id}" class="btn-primary">Réviser</a>
        <a href="create-qcm.html?edit=${qcm._id}" class="btn-secondary">Modifier</a>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', initDashboardPage);
