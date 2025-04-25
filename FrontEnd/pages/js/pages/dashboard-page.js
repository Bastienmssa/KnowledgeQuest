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

<<<<<<< HEAD
  const user = auth.user;
  document.getElementById('dashboard-user-name').textContent = user.name.split(' ')[0];

  try {
    const [stats, qcms] = await Promise.all([
=======
  // Affiche le prénom
  const user = auth.user;
  document.getElementById('dashboard-user-name').textContent =
    user.name.split(' ')[0];

  try {
    const [stats, allQcms] = await Promise.all([
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
      statsService.getUserStats(),
      qcmService.getAllQcms()
    ]);

<<<<<<< HEAD
    const userQcms = qcms.filter(qcm => qcm.createdBy === user.id);

    displayStats(stats, userQcms.length);
    displayMiniChart(stats);
    displayRecentActivity(stats.scoresHistory);
    displayRecentQcms(userQcms);
  } catch (error) {
    console.error('❌ Erreur dans le tableau de bord :', error);
=======
    // Filtrer les QCM créés par cet utilisateur
    const myQcms = allQcms.filter(q => q.createdBy === user.id);

    displayStats(stats, myQcms.length);
    await displayMiniChart(stats);
    displayRecentActivity(stats.scoresHistory);
    displayRecentQcms(myQcms);

  } catch (err) {
    console.error('❌ Erreur dans le tableau de bord :', err);
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
    showNotification("Erreur lors du chargement du tableau de bord", "error");
  }
}

function displayStats(stats, qcmCount) {
<<<<<<< HEAD
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
=======
  document.getElementById('average-score').textContent =
    `${Math.round(stats.averageScore || 0)}%`;
  document.getElementById('qcms-created').textContent = qcmCount ?? '0';
  document.getElementById('tests-completed').textContent =
    stats.scoresHistory?.length ?? '0';
}

async function displayMiniChart(stats) {
  const canvas = document.getElementById('mini-progress-chart');
  if (!canvas) return;

  const { labels, data } = statsService.getLastMonthScores(stats);

  // Charger Chart.js s'il n'est pas déjà disponible
  await ensureChartJsLoaded();

  // Tenter de récupérer/détruire toute instance existante
  try {
    // 1) Par élément
    let existing = Chart.getChart(canvas);
    // 2) Ou par id
    if (!existing) {
      existing = Chart.getChart('mini-progress-chart');
    }
    if (existing) {
      existing.destroy();
    }
  } catch (cleanupErr) {
    console.warn("Aucune ancienne instance à détruire :", cleanupErr);
  }

  // Créer le nouveau graphique
  try {
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Progression',
          data,
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
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
<<<<<<< HEAD
              label: context => `${context.parsed.y} %`
=======
              label: ctx => `${ctx.parsed.y} %`
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
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
<<<<<<< HEAD
  });
=======
  } catch (chartErr) {
    console.error("❌ Impossible de (re)créer le mini-chart :", chartErr);
  }
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
}

function ensureChartJsLoaded() {
  if (window.Chart) return Promise.resolve();
<<<<<<< HEAD

=======
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
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

<<<<<<< HEAD
  const recent = sessions.slice().reverse().slice(0, 5);
  container.innerHTML = recent.map(session => `
    <div class="activity-item">
      <p>${new Date(session.date).toLocaleDateString('fr-FR')} - Score : ${session.score}%</p>
      <a href="results.html?sessionId=${session._id}" class="btn-small">Voir</a>
    </div>
  `).join('');
=======
  const items = sessions
    .slice().reverse()
    .slice(0, 5)
    .map(s => `
      <div class="activity-item">
        <p>${new Date(s.date).toLocaleDateString('fr-FR')} - Score : ${s.score}%</p>
        <a href="results.html?sessionId=${s._id}" class="btn-small">Voir</a>
      </div>
    `).join('');

  container.innerHTML = items;
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
}

function displayRecentQcms(qcms) {
  const container = document.getElementById('recent-qcms');
  if (!container) return;

  if (!qcms || qcms.length === 0) {
    container.innerHTML = '<p>Aucun QCM récent.</p>';
    return;
  }

<<<<<<< HEAD
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

=======
  const cards = qcms.slice(0, 5).map(q => `
    <div class="qcm-card">
      <h3>${q.title}</h3>
      <p>${q.questions.length} questions</p>
      <div class="qcm-actions">
        <a href="take-test.html?qcmId=${q._id}" class="btn-primary">Réviser</a>
        <a href="create-qcm.html?edit=${q._id}" class="btn-secondary">Modifier</a>
      </div>
    </div>
  `).join('');

  container.innerHTML = cards;
}

// Lancer l'init au chargement de la page
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
document.addEventListener('DOMContentLoaded', initDashboardPage);
