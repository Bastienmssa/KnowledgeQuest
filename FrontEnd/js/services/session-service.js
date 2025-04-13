// js/services/session-service.js
import { sessionAPI } from '../api/api.js';

export const sessionService = {
  /**
   * Créer une nouvelle session après un QCM
   * @param {Object} sessionData - Données de la session
   */
  createSession: async (sessionData) => {
    try {
      const response = await sessionAPI.createSession(sessionData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      throw error;
    }
  },

  /**
   * Récupérer les sessions de l'utilisateur
   */
  getUserSessions: async () => {
    try {
      const response = await sessionAPI.getUserSessions();
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      throw error;
    }
  },

  /**
   * Récupérer une session par son ID
   * @param {string} id - ID de la session
   */
  getSessionById: async (id) => {
    try {
      const response = await sessionAPI.getSessionById(id);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la session ${id}:`, error);
      throw error;
    }
  },

  /**
   * Calculer le score pour une session
   * @param {Array} answers - Réponses de l'utilisateur
   * @param {Object} qcm - QCM
   */
  calculateScore: (answers, qcm) => {
    if (!answers || !qcm || !qcm.questions) {
      return 0;
    }

    let correctAnswers = 0;
    const questionsAnswered = [];

    qcm.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctAnswers++;
      }

      questionsAnswered.push({
        question: question.question,
        userAnswer,
        isCorrect
      });
    });

    const score = (correctAnswers / qcm.questions.length) * 100;

    return {
      score,
      questionsAnswered
    };
  }
};