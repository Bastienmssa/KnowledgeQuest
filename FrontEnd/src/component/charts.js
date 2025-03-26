/**
 * Module pour l'initialisation et la gestion des graphiques
 * Utilise Chart.js pour afficher les données statistiques
 */

export function initCharts() {
    console.log("Initializing charts...");
    
    // Créer le graphique d'évolution des scores si présent sur la page
    const scoreChartElement = document.getElementById('score-evolution-chart');
    if (scoreChartElement) {
        initScoreEvolutionChart(scoreChartElement);
    }
    
    // Créer le graphique de répartition par matière si présent
    const subjectChartElement = document.getElementById('subject-distribution-chart');
    if (subjectChartElement) {
        initSubjectDistributionChart(subjectChartElement);
    }
}

// Graphique d'évolution des scores
function initScoreEvolutionChart(canvas) {
    // Utiliser des données de démonstration en attendant les vraies données
    const dates = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const scores = [65, 70, 75, 72, 80, 85];
    
    // Création du graphique avec Chart.js
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Évolution des scores',
                data: scores,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Graphique de répartition par matière
function initSubjectDistributionChart(canvas) {
    // Données de démonstration
    const subjects = ['Anatomie', 'Physiologie', 'Pathologies', 'Pharmacologie'];
    const scores = [85, 70, 60, 75];
    
    // Création du graphique avec Chart.js
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: [{
                label: 'Score moyen par matière',
                data: scores,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(230, 126, 34, 0.7)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(230, 126, 34, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Met à jour les graphiques avec de nouvelles données
export function updateCharts(data) {
    console.log("Updating charts with data:", data);
    
    // Cette fonction serait appelée lorsque de nouvelles données sont disponibles
    // Elle mettrait à jour les graphiques existants avec Chart.js update()
}