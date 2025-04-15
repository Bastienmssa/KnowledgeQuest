// js/services/session-service.js
import api from '../api/api.js';

export const sessionService = {
  async createSession(sessionData) {
    try {
      const response = await api.session.create(sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async getSessionById(id) {
    try {
      const response = await api.session.getById(id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching session ${id}:`, error);
      throw error;
    }
  },

  async getUserSessions() {
    try {
      const response = await api.session.getUserSessions();
      return response.data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  },

  calculateScore(answers, qcm) {
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

export default sessionService;