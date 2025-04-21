// js/services/stats-service.js
import api from '../api/api.js';

export const statsService = {
  async getUserStats() {
    try {
      const response = await api.stats.getUserStats();
      if (!response.success) throw new Error(response.message);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques utilisateur :', error);
      throw error;
    }
  },

  async getAggregatedStats() {
    try {
      const response = await api.stats.getAggregatedStats();
      if (!response.success) throw new Error(response.message);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques globales :', error);
      throw error;
    }
  },

  formatChartData(stats) {
    if (!stats) return { scoreEvolution: {}, subjectPerformance: {} };

    const scoresHistory = stats.scoresHistory || [];

    const scoreEvolution = {
      labels: scoresHistory.map(entry => new Date(entry.date).toLocaleDateString('fr-FR')),
      data: scoresHistory.map(entry => entry.score)
    };

    const subjectPerformance = {
      labels: (stats.subjectPerformance || []).map(entry => entry._id),
      data: (stats.subjectPerformance || []).map(entry => Math.round(entry.averageScore))
    };

    return { scoreEvolution, subjectPerformance };
  },

  getLastWeekScores(stats) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const filtered = stats?.scoresHistory?.filter(e => new Date(e.date) >= oneWeekAgo) || [];

    return {
      labels: filtered.map(e => new Date(e.date).toLocaleDateString('fr-FR')),
      data: filtered.map(e => e.score)
    };
  },

  getLastMonthScores(stats) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const filtered = stats?.scoresHistory?.filter(e => new Date(e.date) >= oneMonthAgo) || [];

    return {
      labels: filtered.map(e => new Date(e.date).toLocaleDateString('fr-FR')),
      data: filtered.map(e => e.score)
    };
  }
};

export default statsService;
