// js/pages/dashboard-page.js

import { auth } from '../utils/auth.js';
import { qcmService } from '../services/qcm-service.js';
import { statsService } from '../services/stats-service.js';
import { showNotification } from '../components/notification.js';

// Extraire le token de l'URL s'il existe (après authentification Microsoft ou Google)
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');

if (tokenFromUrl) {
  console.log("✅ Token reçu via URL, sauvegarde dans localStorage");
  localStorage.setItem("token", tokenFromUrl);
  
  // Nettoyer l'URL pour éviter d'afficher le token
  window.history.replaceState({}, document.title, "dashboard.html");
}

export async function initDashboardPage() {
  console.log("📊 Initialisation du tableau de bord...");

  if (!auth.isLoggedIn) {
    console.log("🔐 Utilisateur non connecté, redirection vers login.html");
    window.location.href = 'login.html';
    return;
  }

  // Initialiser l'interface utilisateur avec les informations de l'utilisateur
  const user = auth.user;
  initUserInterface(user);

  try {
    const [stats, allQcms] = await Promise.all([
      statsService.getUserStats(),
      qcmService.getAllQcms()
    ]);

    // Filtrer les QCM créés par cet utilisateur
    const myQcms = allQcms.filter(q => q.createdBy === user.id);

    displayStats(stats, myQcms.length);
    await displayMiniChart(stats);
    displayRecentActivity(stats.scoresHistory);
    displayRecentQcms(myQcms);

  } catch (err) {
    console.error('❌ Erreur dans le tableau de bord :', err);
    showNotification("Erreur lors du chargement du tableau de bord", "error");
  }
}

// Initialiser l'interface utilisateur avec les informations de l'utilisateur
function initUserInterface(user) {
  // Afficher le nom de l'utilisateur dans le titre
  const dashboardUserName = document.getElementById('dashboard-user-name');
  if (dashboardUserName) {
    dashboardUserName.textContent = user.name.split(' ')[0];
  }

  // Initialiser l'avatar utilisateur si présent
  const avatar = document.querySelector('.initials-avatar');
  if (avatar) {
    const initials = user.name
      .split(' ')
      .map(n => n[0]?.toUpperCase() || '')
      .join('');
    avatar.textContent = initials;
  }

  // Initialiser le nom et le domaine dans la sidebar
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) {
    sidebarName.textContent = user.name;
  }

  const sidebarDomain = document.getElementById('sidebar-user-domain');
  if (sidebarDomain) {
    sidebarDomain.textContent = user.domain || 'Domaine';
    sidebarDomain.classList.remove('medicine', 'law');
    sidebarDomain.classList.add(user.domain === 'Médecine' ? 'medicine' : 'law');
  }

  // Appliquer le domaine comme attribut de données sur le body pour le styling CSS
  document.body.setAttribute('data-domain', user.domain || 'none');
}

function displayStats(stats, qcmCount) {
  // Mettre à jour les statistiques dans l'interface
  const averageScore = document.getElementById('average-score');
  if (averageScore) {
    averageScore.textContent = `${Math.round(stats.averageScore || 0)}%`;
  }

  const qcmsCreated = document.getElementById('qcms-created');
  if (qcmsCreated) {
    qcmsCreated.textContent = qcmCount ?? '0';
  }

  const testsCompleted = document.getElementById('tests-completed');
  if (testsCompleted) {
    testsCompleted.textContent = stats.scoresHistory?.length ?? '0';
  }
}

async function displayMiniChart(stats) {
  const canvas = document.getElementById('mini-progress-chart');
  if (!canvas) return;

  const { labels, data } = statsService.getLastMonthScores(stats);

  // Charger Chart.js s'il n'est pas déjà disponible
  await ensureChartJsLoaded();

  // Nettoyer toute instance existante du graphique
  try {
    let existing = Chart.getChart(canvas);
    if (!existing) existing = Chart.getChart('mini-progress-chart');
    if (existing) existing.destroy();
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
              label: ctx => `${ctx.parsed.y} %`
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
  } catch (chartErr) {
    console.error("❌ Impossible de (re)créer le mini-chart :", chartErr);
  }
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
    container.innerHTML = '<p>Aucune activité récente pour le moment.</p>';
    return;
  }

  const items = sessions
    .slice().reverse()
    .slice(0, 5)
    .map(s => `
      <div class="activity-item">
        <div class="activity-details">
          <span class="activity-date">${new Date(s.date).toLocaleDateString('fr-FR')}</span>
          <span class="activity-score">${s.score}%</span>
        </div>
        <a href="results.html?sessionId=${s._id}" class="btn-small">Voir</a>
      </div>
    `).join('');

  container.innerHTML = items;
}

function displayRecentQcms(qcms) {
  const container = document.getElementById('recent-qcms');
  if (!container) return;

  if (!qcms || qcms.length === 0) {
    container.innerHTML = '<p>Aucun QCM récent.</p>';
    return;
  }

  const cards = qcms.slice(0, 5).map(q => {
    // Déterminer la classe CSS du badge en fonction de la catégorie
    let badgeClass = '';
    if (q.category) {
      badgeClass = q.category.toLowerCase();
    } else if (q.domain === 'Médecine') {
      badgeClass = 'medicine';
    } else if (q.domain === 'Droit') {
      badgeClass = 'law';
    }
    
    return `
      <div class="qcm-item">
        <h3>${q.title} <span class="qcm-badge ${badgeClass}">${q.category || q.domain || ''}</span></h3>
        <p>${q.questions.length} question${q.questions.length > 1 ? 's' : ''}</p>
        <div class="qcm-actions">
          <a href="take-test.html?qcmId=${q._id}" class="btn-primary">Réviser</a>
          <a href="create-qcm.html?edit=${q._id}" class="btn-secondary">Modifier</a>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = cards;
}

// Configurer les boutons de déconnexion
function setupLogoutButtons() {
  const buttons = document.querySelectorAll('.logout-btn, #logout-button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html?logout=true';
    });
  });
}

// Initialiser la page au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  initDashboardPage();
  setupLogoutButtons();
  
  // Configurer le toggle du sidebar
  const toggleBtn = document.getElementById('toggle-sidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.querySelector('.app-container').classList.toggle('sidebar-collapsed');
    });
  }
});