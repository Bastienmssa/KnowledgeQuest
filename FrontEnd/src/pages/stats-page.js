/**
 * Gestionnaire pour la page de statistiques
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';
import { initCharts, updateCharts } from '../component/charts.js';

// Initialiser la page des statistiques
export function initStatsPage() {
    console.log("Initializing stats page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialiser les graphiques
    initCharts();
    
    // Charger les statistiques
    loadStats();
    
    // Initialiser les filtres
    initFilters();
}

// Charger les statistiques depuis l'API
async function loadStats() {
    try {
        // Afficher un indicateur de chargement
        const statsContainer = document.querySelector('.stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = '<div class="loading-spinner">Chargement des statistiques...</div>';
        }
        
        // Récupérer les statistiques
        const response = await window.KnowledgeQuestAPI.getStats();
        
        if (response.success) {
            // Construire l'interface des statistiques
            buildStatsInterface(response.stats);
        } else {
            showStatsError('Erreur lors du chargement des statistiques: ' + (response.message || 'Données non disponibles'));
        }
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        showStatsError('Une erreur est survenue lors du chargement des statistiques.');
    }
}

// Construire l'interface des statistiques
function buildStatsInterface(stats) {
    console.log("Building stats interface with data:", stats);
    
    const statsContainer = document.querySelector('.stats-container');
    if (!statsContainer) return;
    
    // Vérifier si des statistiques sont disponibles
    if (!stats || !stats.scoresHistory || stats.scoresHistory.length === 0) {
        statsContainer.innerHTML = `
            <div class="empty-state">
                <h2>Aucune statistique disponible</h2>
                <p>Vous n'avez pas encore effectué de tests. Complétez quelques QCM pour voir vos statistiques.</p>
                <a href="take-test.html" class="btn-primary">Faire un test</a>
            </div>
        `;
        return;
    }
    
    // Construire l'interface
    statsContainer.innerHTML = `
        <div class="stats-overview">
            <div class="stat-card">
                <h3>Score moyen</h3>
                <p class="stat-value">${Math.round(stats.averageScore)}%</p>
                ${getScoreTrendHtml(stats.scoresHistory)}
            </div>
            <div class="stat-card">
                <h3>Tests complétés</h3>
                <p class="stat-value">${stats.scoresHistory.length}</p>
            </div>
            <div class="stat-card">
                <h3>Meilleur score</h3>
                <p class="stat-value">${Math.max(...stats.scoresHistory.map(item => item.score))}%</p>
            </div>
            <div class="stat-card">
                <h3>Progression</h3>
                <div class="streak-indicator">
                    ${getProgressionIndicator(stats.scoresHistory)}
                </div>
            </div>
        </div>
        
        <div class="stats-charts">
            <div class="chart-container">
                <h3>Évolution des scores</h3>
                <canvas id="score-evolution-chart"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>Répartition par matière</h3>
                <canvas id="subject-distribution-chart"></canvas>
            </div>
        </div>
        
        <div class="stats-recommendations">
            <h3>Recommandations</h3>
            <div class="recommendations-list">
                ${getRecommendationsHtml(stats)}
            </div>
        </div>
    `;
    
    // Mettre à jour les graphiques avec les données
    updateCharts(stats);
}

// Obtenir le HTML de la tendance du score
function getScoreTrendHtml(scoresHistory) {
    if (scoresHistory.length < 2) return '';
    
    // Calculer la tendance (différence entre le dernier et l'avant-dernier score)
    const lastScore = scoresHistory[scoresHistory.length - 1].score;
    const previousScore = scoresHistory[scoresHistory.length - 2].score;
    const difference = lastScore - previousScore;
    
    if (difference > 0) {
        return `<p class="stat-trend positive">↑ ${Math.abs(difference)}% depuis le dernier test</p>`;
    } else if (difference < 0) {
        return `<p class="stat-trend negative">↓ ${Math.abs(difference)}% depuis le dernier test</p>`;
    } else {
        return `<p class="stat-trend">Stable depuis le dernier test</p>`;
    }
}

// Obtenir l'indicateur de progression
function getProgressionIndicator(scoresHistory) {
    if (scoresHistory.length < 7) {
        // Si moins de 7 tests, afficher simplement les scores disponibles
        return scoresHistory.map(item => {
            const score = item.score;
            return `<span class="streak ${score >= 70 ? 'active' : 'inactive'}" data-score="${score}"></span>`;
        }).join('');
    } else {
        // Sinon, afficher les 7 derniers tests
        return scoresHistory.slice(-7).map(item => {
            const score = item.score;
            return `<span class="streak ${score >= 70 ? 'active' : 'inactive'}" data-score="${score}"></span>`;
        }).join('');
    }
}

// Obtenir les recommandations basées sur les statistiques
function getRecommendationsHtml(stats) {
    // Exemple de recommandations (à remplacer par de vraies recommandations basées sur les données)
    return `
        <div class="recommendation-item">
            <div class="recommendation-icon">📚</div>
            <div class="recommendation-content">
                <h4>Concentrez-vous sur les QCM de Physiologie</h4>
                <p>Vos scores sont plus faibles dans cette matière. Entraînez-vous davantage.</p>
            </div>
        </div>
        <div class="recommendation-item">
            <div class="recommendation-icon">🔄</div>
            <div class="recommendation-content">
                <h4>Révisez régulièrement</h4>
                <p>Pour améliorer votre rétention, essayez de faire au moins 3 QCM par semaine.</p>
            </div>
        </div>
        <div class="recommendation-item">
            <div class="recommendation-icon">🎯</div>
            <div class="recommendation-content">
                <h4>Créez des QCM plus variés</h4>
                <p>Diversifier vos questions vous aidera à mieux comprendre les différents aspects du sujet.</p>
            </div>
        </div>
    `;
}

// Initialiser les filtres de statistiques
function initFilters() {
    const filterForm = document.getElementById('stats-filter-form');
    if (!filterForm) return;
    
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Récupérer les valeurs des filtres
        const filters = {
            subject: document.getElementById('filter-subject').value,
            period: document.getElementById('filter-period').value
        };
        
        // Ne pas inclure les filtres vides
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });
        
        try {
            // Récupérer les statistiques filtrées
            const response = await window.KnowledgeQuestAPI.getStats(filters);
            
            if (response.success) {
                // Mettre à jour l'interface
                buildStatsInterface(response.stats);
            } else {
                showMessage(document.querySelector('.stats-container'), 'Erreur lors du filtrage des statistiques', 'error');
            }
        } catch (error) {
            console.error('Erreur lors du filtrage des statistiques:', error);
            showMessage(document.querySelector('.stats-container'), 'Erreur lors du filtrage des statistiques', 'error');
        }
    });
    
    // Réinitialiser les filtres
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            filterForm.reset();
            loadStats(); // Recharger les statistiques sans filtre
        });
    }
}

// Afficher une erreur de statistiques
function showStatsError(message) {
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="error-state">
                <h2>Erreur</h2>
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">Réessayer</button>
            </div>
        `;
    } else {
        alert(message);
    }
}