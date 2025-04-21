const Session = require('../models/Session');
const Stats = require('../models/Stats');
const Qcm = require('../models/Qcm');
const logger = require('../utils/logger');

// 🔄 Créer une nouvelle session après passage d'un test
exports.createSession = async (req, res) => {
  try {
    const { qcmId, score, duration, questionsAnswered } = req.body;

    if (!qcmId || score === undefined || duration === undefined || !Array.isArray(questionsAnswered)) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un ID de QCM, un score, une durée et les réponses.'
      });
    }

    const qcm = await Qcm.findById(qcmId);
    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }

    // 🔁 Reconstruction sécurisée des réponses
    const finalAnswers = questionsAnswered.map((item, index) => {
      const question = qcm.questions[index];

      return {
        question: question?.question || 'Question non disponible',
        userAnswer: item?.userAnswer ?? '<Aucune>',
        correctAnswer: question?.correctAnswer ?? 'Non définie',
        isCorrect: item?.isCorrect ?? false
      };
    });

    // 💾 Création de la session
    const session = await Session.create({
      userId: req.user.id,
      qcmId,
      score,
      duration,
      questionsAnswered: finalAnswers
    });

    // 📊 Mise à jour des statistiques utilisateur
    let stats = await Stats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new Stats({
        userId: req.user.id,
        scoresHistory: [],
        averageScore: score
      });
    }

    stats.scoresHistory.push({ date: new Date(), score });
    const totalScore = stats.scoresHistory.reduce((acc, s) => acc + s.score, 0);
    stats.averageScore = totalScore / stats.scoresHistory.length;

    await stats.save();

    logger.info(`✅ Session enregistrée : user=${req.user.id}, sessionId=${session._id}, score=${score}, durée=${duration}s`);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session._id,
        stats
      }
    });
  } catch (error) {
    logger.error(`❌ Erreur création session : ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session',
      error: error.message
    });
  }
};

// 📄 Récupérer une session par ID
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

    if (session.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit à cette session'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error(`❌ Erreur getSessionById : ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session',
      error: error.message
    });
  }
};

// 📋 Récupérer toutes les sessions d’un utilisateur
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ces sessions'
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
    logger.error(`❌ Erreur getUserSessions : ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions',
      error: error.message
    });
  }
};
