const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

// Protéger toutes les routes
router.use(protect);

// Routes pour les sessions
router.route('/')
  .post(sessionController.createSession);

router.route('/:id')
  .get(sessionController.getSessionById);

router.get('/user/:userId?', sessionController.getUserSessions);

module.exports = router;