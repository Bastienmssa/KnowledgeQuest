// js/pages/home-page.js
import { auth } from '../utils/auth.js';
import { sessionService } from '../services/session-service.js';
import { showNotification } from '../components/notification.js';

export async function initHomePage() {
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const user = auth.user;
  if (user) {
    document.getElementById('user-first-name').textContent = user.name.split(' ')[0];
  }

  try {
    const stats = await sessionService.getUserStats(); // get average score, etc.
    const sessions = await sessionService.getUserSessions({ limit: 3 });

    if (stats?.averageScore) {
      const progress = Math.round(stats.averageScore);
      const progressCircle = document.querySelector('.progress-circle');
      progressCircle.dataset.progress = progress;
      progressCircle.innerHTML = `<span>${progress}%</span>`;
    }

    const container = document.getElementById('recent-activity');
    container.innerHTML = '';

    if (sessions.length === 0) {
      container.innerHTML = '<p>Aucune activité récente pour le moment.</p>';
    } else {
      sessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-icon">✅</div>
          <div class="timeline-content">
            <h4>Test : ${session.qcm?.title || 'QCM'}</h4>
            <p>Score : ${session.score}% - ${new Date(session.createdAt).toLocaleDateString()}</p>
            <a href="results.html?sessionId=${session._id}" class="btn-small">Voir les résultats</a>
          </div>
        `;
        container.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur lors du chargement des données de l\'accueil', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initHomePage);
