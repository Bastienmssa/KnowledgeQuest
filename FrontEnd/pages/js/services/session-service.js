// js/services/session-service.js
import api from '../api/api.js';

export const sessionService = {
  async createSession(sessionData) {
    try {
      const response = await api.session.create(sessionData);
      const sessionId = response?.data?.sessionId;

      if (!sessionId) {
        console.error("❌ Réponse backend invalide :", response);
        throw new Error("Session ID non reçu du backend");
      }

      console.log("✅ Session créée avec ID :", sessionId);
      return { sessionId };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la session:', error);
      throw error;
    }
  },

  async getSessionById(id) {
    try {
      const response = await api.session.getById(id);
      if (!response?.data) throw new Error("Données session non disponibles");

      console.log("📄 Session récupérée :", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de la session ${id}:`, error);
      throw error;
    }
  },

  async getUserSessions(userId = '') {
    try {
      const response = await api.session.getUserSessions(userId); // Ajout de userId vide par défaut
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sessions utilisateur:', error);
      throw error;
    }
  },

  calculateScore(answers, qcm) {
    if (!answers || !qcm || !Array.isArray(qcm.questions)) {
      return { score: 0, questionsAnswered: [] };
    }

    let correctAnswers = 0;
    const questionsAnswered = qcm.questions.map((question, i) => {
      const userIndex = answers[i];
      const userAnswer = userIndex !== null && userIndex !== undefined
        ? question.choices[userIndex]
        : null;

      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctAnswers / qcm.questions.length) * 100);
    return { score, questionsAnswered };
  }
};

export default sessionService;
