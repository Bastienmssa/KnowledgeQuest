import api from '../api/api.js';

export const statsService = {
  async getUserStats() {
    try {
      const response = await api.stats.getUserStats();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
      throw error;
    }
  },

  async getAggregatedStats() {
    try {
      const response = await api.stats.getAggregatedStats();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      throw error;
    }
  },

  formatChartData(stats) {
    if (!stats) return null;

    const scoresHistory = stats.scoresHistory || [];

    const scoreEvolution = {
      labels: scoresHistory.map(entry => new Date(entry.date).toLocaleDateString('fr-FR')),
      data: scoresHistory.map(entry => entry.score),
    };

    const subjectPerformance = {
      labels: (stats.subjectPerformance || []).map(entry => entry._id),
      data: (stats.subjectPerformance || []).map(entry => entry.averageScore),
    };

    return { scoreEvolution, subjectPerformance };
  },

  getLastMonthScores(stats) {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const filtered = stats.scoresHistory?.filter(entry =>
      new Date(entry.date) >= oneMonthAgo
    ) || [];

    return {
      labels: filtered.map(e => new Date(e.date).toLocaleDateString('fr-FR')),
      data: filtered.map(e => e.score),
    };
  },

  getLastWeekScores(stats) {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const filtered = stats.scoresHistory?.filter(entry =>
      new Date(entry.date) >= oneWeekAgo
    ) || [];

    return {
      labels: filtered.map(e => new Date(e.date).toLocaleDateString('fr-FR')),
      data: filtered.map(e => e.score),
    };
  }
};

export default statsService;
