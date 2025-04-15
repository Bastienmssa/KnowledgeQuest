// js/utils/charts.js
import { statsService } from '../services/stats-service.js';

export function initCharts(stats) {
  console.log("Initializing charts...");

  ensureChartJsLoaded().then(() => {
    const scoreChartElement = document.getElementById('scores-chart');
    if (scoreChartElement) {
      initScoreEvolutionChart(scoreChartElement, statsService.formatChartData(stats).scoreEvolution);
    }

    const subjectChartElement = document.getElementById('distribution-chart');
    if (subjectChartElement) {
      initSubjectDistributionChart(subjectChartElement, statsService.formatChartData(stats).subjectPerformance);
    }
  });
}

async function ensureChartJsLoaded() {
  if (window.Chart) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initScoreEvolutionChart(canvas, data) {
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Évolution des scores',
        data: data.data,
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
      labels: data.labels,
      datasets: [{
        label: 'Score moyen par matière',
        data: data.data,
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

export function updateCharts(stats, timeFilter) {
  console.log("Updating charts with data:", stats);
  const charts = Object.values(Chart.instances);

  charts.forEach(chart => {
    if (chart.canvas.id === 'scores-chart') {
      let scoreData;
      switch (timeFilter) {
        case 'month':
          scoreData = statsService.getLastMonthScores(stats);
          break;
        case 'week':
          scoreData = statsService.getLastWeekScores(stats);
          break;
        default:
          scoreData = statsService.formatChartData(stats).scoreEvolution;
      }
      chart.data.labels = scoreData.labels;
      chart.data.datasets[0].data = scoreData.data;
      chart.update();
    } else if (chart.canvas.id === 'distribution-chart') {
      chart.data.labels = statsService.formatChartData(stats).subjectPerformance.labels;
      chart.data.datasets[0].data = statsService.formatChartData(stats).subjectPerformance.data;
      chart.update();
    }
  });
}