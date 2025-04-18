/**
 * Gestionnaire pour la page du tableau de bord
 */
import { authService } from '../services/auth-service.js';
import { qcmService } from '../services/qcm-service.js';
import { sessionService } from '../services/session-service.js';
import { statsService } from '../services/stats-service.js';
import { notifyError, notifyInfo } from '../components/notification.js';

export async function initDashboardPage() {
  console.log("🔁 Initialisation du tableau de bord...");

  if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const user = authService.getCurrentUser();
    updateUserInfo(user);

    const [qcms, sessions, stats] = await Promise.all([
      qcmService.getAllQcms({ limit: 5 }),
      sessionService.getUserSessions(),
      statsService.getUserStats()
    ]);

    displayRecentQCMs(qcms);
    displayUserStats(stats);
    displayRecentActivity(sessions);

    notifyInfo(`Bienvenue ${user.name.split(' ')[0]} 👋`);
  } catch (error) {
    console.error('❌ Erreur tableau de bord:', error);
    notifyError("Impossible de charger le tableau de bord.");
  }
}

function updateUserInfo(user) {
  const nameEls = document.querySelectorAll('#user-name');
  nameEls.forEach(el => el.textContent = user.name);

  const domainEl = document.querySelector('.domain-badge');
  if (domainEl) {
    domainEl.textContent = user.domain;
    domainEl.classList.remove('medicine', 'law');
    domainEl.classList.add(user.domain === 'Médecine' ? 'medicine' : 'law');
  }
}

function displayRecentQCMs(qcms) {
  const container = document.getElementById('recent-qcms');
  if (!container) return;

  if (!qcms || qcms.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Aucun QCM disponible</p>
        <a href="create-qcm.html" class="btn-primary">Créer un QCM</a>
      </div>
    `;
    return;
  }

  container.innerHTML = qcms.map(qcm => `
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

function displayUserStats(stats) {
  document.getElementById("average-score").textContent = `${Math.round(stats.averageScore || 0)}%`;
  document.getElementById("qcms-created").textContent = stats.qcmCount || 0;
  document.getElementById("tests-completed").textContent = stats.scoresHistory?.length || 0;

  // mini chart à implémenter avec Chart.js si tu veux
}

function displayRecentActivity(sessions) {
  const container = document.getElementById('recent-activity');
  if (!container) return;

  if (!sessions || sessions.length === 0) {
    container.innerHTML = `<p>Aucune activité récente</p>`;
    return;
  }

  container.innerHTML = sessions.slice(0, 5).map(session => `
    <div class="activity-item">
      <p>${new Date(session.createdAt).toLocaleDateString()} - Score : ${session.score}%</p>
      <a href="results.html?sessionId=${session._id}" class="btn-small">Voir</a>
    </div>
  `).join('');
}
