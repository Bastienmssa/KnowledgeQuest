// js/services/stats-service.js
import { statsAPI } from '../api/api.js';

export const statsService = {
  /**
   * Récupérer les statistiques de l'utilisateur
   */
  getUserStats: async () => {
    try {
      const response = await statsAPI.getUserStats();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques agrégées
   */
  getAggregatedStats: async () => {
    try {
      const response = await statsAPI.getAggregatedStats();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques agrégées:', error);
      throw error;
    }
  },

  /**
   * Formater les données pour l'affichage des graphiques
   * @param {Object} stats - Statistiques brutes
   */
  formatChartData: (stats) => {
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