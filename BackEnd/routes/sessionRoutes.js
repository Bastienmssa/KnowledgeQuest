const express = require('express');
const Session = require('../models/Session');
const Stats = require('../models/Stats');
const router = express.Router();

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { userId, qcmId, score, questionsAnswered } = req.body;

    // Create new session
    const newSession = new Session({ userId, qcmId, score, questionsAnswered });
    await newSession.save();

    // Update user stats
    let userStats = await Stats.findOne({ userId });

    if (!userStats) {
      userStats = new Stats({
        userId,
        scoresHistory: [],
        averageScore: score
      });
    }

    userStats.scoresHistory.push({ date: new Date(), score });

    // Calculate average score
    const totalScores = userStats.scoresHistory.map(s => s.score);
    userStats.averageScore = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;

    await userStats.save();

    res.status(201).json({ session: newSession, stats: userStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get sessions by user id
// @route   GET /api/sessions/user/:userId
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId })
      .populate('qcmId')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;