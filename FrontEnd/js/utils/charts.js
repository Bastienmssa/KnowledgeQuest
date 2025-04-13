// js/utils/charts.js
import { statsService } from '../services/stats-service.js';

export function initCharts() {
  console.log("Initializing charts...");
  
  ensureChartJsLoaded().then(() => {
    const scoreChartElement = document.getElementById('score-evolution-chart');
    if (scoreChartElement) {
      loadScoreEvolutionData(scoreChartElement);
    }
    
    const subjectChartElement = document.getElementById('subject-distribution-chart');
    if (subjectChartElement) {
      loadSubjectDistributionData(subjectChartElement);
    }
  });
}

async function ensureChartJsLoaded() {
  if (window.Chart) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadScoreEvolutionData(canvas) {
  try {
    const stats = await statsService.getUserStats();
    
    if (stats) {
      const chartData = statsService.formatChartData(stats);
      
      initScoreEvolutionChart(canvas, {
        labels: chartData.scoreEvolution.labels,
        scores: chartData.scoreEvolution.data
      });
    } else {
      initScoreEvolutionChart(canvas, {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        scores: [65, 70, 75, 72, 80, 85]
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données d\'évolution des scores:', error);
    initScoreEvolutionChart(canvas, {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      scores: [65, 70, 75, 72, 80, 85]
    });
  }
}

async function loadSubjectDistributionData(canvas) {
  try {
    const response = await KnowledgeQuestAPI.stats.getAggregatedStats();
    
    if (response.success && response.data && response.data.subjectStats) {
      const subjectStats = response.data.subjectStats || [];
      const subjects = subjectStats.map(item => item._id);
      const scores = subjectStats.map(item => item.averageScore);
      
      initSubjectDistributionChart(canvas, { subjects, scores });
    } else {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      if (user.domain === 'Médecine') {
        initSubjectDistributionChart(canvas, {
          subjects: ['Anatomie', 'Physiologie', 'Pathologies', 'Pharmacologie'],
          scores: [85, 70, 60, 75]
        });
      } else {
        initSubjectDistributionChart(canvas, {
          subjects: ['Droit civil', 'Droit pénal', 'Droit constitutionnel', 'Droit européen'],
          scores: [75, 82, 65, 70]
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données de distribution par matière:', error);
    initSubjectDistributionChart(canvas, {
      subjects: ['Anatomie', 'Physiologie', 'Pathologies', 'Pharmacologie'],
      scores: [85, 70, 60, 75]
    });
  }
}

function initScoreEvolutionChart(canvas, data) {
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Évolution des scores',
        data: data.scores,
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

function initSubjectDistributionChart(canvas, data) {
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.subjects,
      datasets: [{
        label: 'Score moyen par matière',
        data: data.scores,
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

export function updateCharts(data) {
  console.log("Updating charts with data:", data);
  const charts = Object.values(Chart.instances);
  
  charts.forEach(chart => {
    if (chart.canvas.id === 'score-evolution-chart' && data.scoresHistory) {
      chart.data.labels = data.scoresHistory.map(item => item.date);
      chart.data.datasets[0].data = data.scoresHistory.map(item => item.score);
      chart.update();
    } else if (chart.canvas.id === 'subject-distribution-chart' && data.subjectScores) {
      chart.data.labels = Object.keys(data.subjectScores);
      chart.data.datasets[0].data = Object.values(data.subjectScores);
      chart.update();
    }
  });
}