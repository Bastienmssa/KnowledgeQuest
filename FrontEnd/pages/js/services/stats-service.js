// js/services/stats-service.js
import api from '../api/api.js';

export const statsService = {
  async getUserStats() {
    try {
      const response = await api.stats.getUserStats();
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  async getAggregatedStats() {
    try {
      const response = await api.stats.getAggregatedStats();
      return response.data;
    } catch (error) {
      console.error('Error fetching aggregated stats:', error);
      throw error;
    }
  },

  formatChartData(stats) {
    if (!stats) return null;

    // Format pour le graphique d'évolution des scores
    const scoresHistory = stats.scoresHistory || [];
    const scoreLabels = scoresHistory.map(entry => {
      const date = new Date(entry.date);
      return date.toLocaleDateString();
    });
    const scoreValues = scoresHistory.map(entry => entry.score);

    // Format pour le graphique de performance par matière
    const subjectPerformance = stats.subjectPerformance || [];
    const subjectLabels = subjectPerformance.map(entry => entry._id);
    const subjectScores = subjectPerformance.map(entry => entry.averageScore);

    return {
      scoreEvolution: {
        labels: scoreLabels,
        data: scoreValues
      },
      subjectPerformance: {
        labels: subjectLabels,
        data: subjectScores
      }
    };
  }
};

export default statsService;