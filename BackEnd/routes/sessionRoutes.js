const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');
const Stats = require('../models/Stats');

// @desc    Créer une nouvelle session de QCM
// @route   POST /api/sessions
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { qcmId, score, questionsAnswered } = req.body;
    
    if (!qcmId || score === undefined || !questionsAnswered) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez fournir un ID de QCM, un score et les questions répondues'
      });
    }
    
    // Créer la session
    const session = await Session.create({
      userId: req.user._id,
      qcmId,
      score,
      questionsAnswered
    });
    
    // Mettre à jour les statistiques de l'utilisateur
    const userStats = await Stats.findOne({ userId: req.user._id });
    
    if (userStats) {
      userStats.scoresHistory.push({
        date: Date.now(),
        score,
        qcmId
      });
      
      // Recalculer la moyenne
      if (userStats.scoresHistory.length > 0) {
        const totalScore = userStats.scoresHistory.reduce((acc, curr) => acc + curr.score, 0);
        userStats.averageScore = totalScore / userStats.scoresHistory.length;
      }
      
      await userStats.save();
    }
    
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Obtenir toutes les sessions de l'utilisateur
// @route   GET /api/sessions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .populate('qcmId', 'title subject')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Obtenir une session spécifique
// @route   GET /api/sessions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('qcmId');
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session non trouvée' });
    }
    
    // Vérifier si l'utilisateur est bien le propriétaire de la session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Non autorisé à accéder à cette session' });
    }
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;