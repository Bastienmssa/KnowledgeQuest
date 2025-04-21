// js/pages/home-page.js
import { auth } from '../utils/auth.js';
import { statsService } from '../services/stats-service.js';
import { showNotification } from '../components/notification.js';

export async function initHomePage() {
  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const user = auth.user;
  if (user) {
    const nameEl = document.getElementById('user-first-name');
    if (nameEl) nameEl.textContent = user.name.split(' ')[0];
  }

  try {
    const stats = await statsService.getUserStats(); // ✅ récupère score + sessions

    // Affichage de la progression moyenne
    if (stats?.averageScore !== undefined) {
      const progress = Math.round(stats.averageScore);
      const progressCircle = document.querySelector('.progress-circle');
      const progressText = document.getElementById('progress-score');

      if (progressCircle && progressText) {
        progressCircle.dataset.progress = progress;
        progressText.textContent = `${progress}%`;
        progressCircle.addEventListener('click', () => {
          window.location.href = 'stats.html';
        });
        progressCircle.style.cursor = 'pointer';
        progressCircle.title = 'Voir mes statistiques';
      }
    }

    // Affichage de l’activité récente
    const container = document.getElementById('recent-activity');
    if (!container) return;

    const history = stats?.scoresHistory || [];

    container.innerHTML = '';
    if (history.length === 0) {
      container.innerHTML = '<p>Aucune activité récente pour le moment.</p>';
    } else {
      history.slice().reverse().slice(0, 3).forEach(session => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-icon">✅</div>
          <div class="timeline-content">
            <h4>Test : ${session.qcmTitle || 'QCM'}</h4>
            <p>Score : ${session.score}% - ${new Date(session.date).toLocaleDateString('fr-FR')}</p>
            <a href="results.html?sessionId=${session._id}" class="btn-small">Voir les résultats</a>
          </div>
        `;
        container.appendChild(item);
      });
    }

  } catch (error) {
    console.error('Erreur:', error);
    showNotification("Erreur lors du chargement des données de l'accueil", 'error');
  }
}

document.addEventListener('DOMContentLoaded', initHomePage);
