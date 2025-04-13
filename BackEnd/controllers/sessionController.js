// controllers/sessionController.js
const Session = require('../models/Session');
const Stats = require('../models/Stats');
const logger = require('../utils/logger');

// Créer une nouvelle session
exports.createSession = async (req, res) => {
  try {
    const { qcmId, score, questionsAnswered } = req.body;
    
    // Valider les données
    if (!qcmId || score === undefined || !questionsAnswered) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un ID de QCM, un score et les questions répondues'
      });
    }
    
    // Créer la session
    const session = new Session({
      userId: req.user.id,
      qcmId,
      score,
      questionsAnswered
    });
    
    await session.save();
    
    // Mettre à jour les statistiques de l'utilisateur
    let userStats = await Stats.findOne({ userId: req.user.id });
    
    if (!userStats) {
      userStats = new Stats({
        userId: req.user.id,
        scoresHistory: [],
        averageScore: score
      });
    }
    
    userStats.scoresHistory.push({ date: new Date(), score });
    
    // Calculer le score moyen
    const totalScores = userStats.scoresHistory.map(s => s.score);
    userStats.averageScore = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
    
    await userStats.save();
    
    res.status(201).json({
      success: true,
      data: {
        session,
        stats: userStats
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la création de la session: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session',
      error: error.message
    });
  }
};

// Récupérer les sessions d'un utilisateur
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Vérifier que l'utilisateur ne peut voir que ses propres sessions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir les sessions de cet utilisateur'
      });
    }
    
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .populate('qcmId', 'title subject');
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des sessions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions',
      error: error.message
    });
  }
};

// Récupérer une session spécifique
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('qcmId', 'title subject questions');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur ne peut voir que ses propres sessions
    if (session.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir cette session'
      });
    }
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération de la session: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session',
      error: error.message
    });
  }
};