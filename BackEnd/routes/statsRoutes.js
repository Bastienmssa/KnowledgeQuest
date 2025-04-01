const express = require('express');
const Stats = require('../models/Stats');
const router = express.Router();

// @desc    Get user stats
// @route   GET /api/stats/:userId
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    const stats = await Stats.findOne({ userId: req.params.userId });
    if (!stats) {
      return res.status(404).json({ message: 'Stats not found' });
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;