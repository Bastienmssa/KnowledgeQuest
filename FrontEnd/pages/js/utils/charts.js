// js/utils/charts.js

import { statsService } from '../services/stats-service.js';

export function initCharts(stats) {
  console.log("Initialisation des graphiques...");

  ensureChartJsLoaded().then(() => {
    const chartData = statsService.formatChartData(stats);

    const scoreChartElement = document.getElementById('scores-chart');
    if (scoreChartElement) {
      initScoreEvolutionChart(scoreChartElement, chartData.scoreEvolution);
    }

    const subjectChartElement = document.getElementById('distribution-chart');
    if (subjectChartElement) {
      initSubjectDistributionChart(subjectChartElement, chartData.subjectPerformance);
    }
  });
}

function ensureChartJsLoaded() {
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
        tension: 0.3,
        fill: true
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
          title: {
            display: true,
            text: 'Score (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
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
          'rgba(241, 196, 15, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 1
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
          title: {
            display: true,
            text: 'Score moyen (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Matières'
          }
        }
      }
    }
  });
}

export function updateCharts(stats, timeFilter) {
  console.log("Mise à jour des graphiques avec filtre :", timeFilter);
  const chartInstances = Chart.instances || Object.values(Chart.registry?.instances || {});

  chartInstances.forEach(chart => {
    if (chart.canvas.id === 'scores-chart') {
      let data;
      switch (timeFilter) {
        case 'month':
          data = statsService.getLastMonthScores(stats);
          break;
        case 'week':
          data = statsService.getLastWeekScores(stats);
          break;
        default:
          data = statsService.formatChartData(stats).scoreEvolution;
      }

      chart.data.labels = data.labels;
      chart.data.datasets[0].data = data.data;
      chart.update();
    }

    if (chart.canvas.id === 'distribution-chart') {
      const dist = statsService.formatChartData(stats).subjectPerformance;
      chart.data.labels = dist.labels;
      chart.data.datasets[0].data = dist.data;
      chart.update();
    }
  });
}
