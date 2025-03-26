const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Stats = require('../models/Stats');

// @desc    Obtenir les statistiques de l'utilisateur
// @route   GET /api/stats
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const stats = await Stats.findOne({ userId: req.user._id })
      .populate('scoresHistory.qcmId', 'title subject');
    
    if (!stats) {
      return res.status(404).json({ success: false, error: 'Statistiques non trouvées' });
    }
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Réinitialiser les statistiques de l'utilisateur
// @route   DELETE /api/stats/reset
// @access  Private
router.delete('/reset', protect, async (req, res) => {
  try {
    const stats = await Stats.findOne({ userId: req.user._id });
    
    if (!stats) {
      return res.status(404).json({ success: false, error: 'Statistiques non trouvées' });
    }
    
    stats.scoresHistory = [];
    stats.averageScore = 0;
    await stats.save();
    
    res.status(200).json({
      success: true,
      message: 'Statistiques réinitialisées avec succès',
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;