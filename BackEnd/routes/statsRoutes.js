const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const statsController = require('../controllers/statsController');

// Protéger toutes les routes
router.use(protect);

// Routes pour les statistiques
router.get('/:userId?', statsController.getUserStats);
router.get('/aggregated/data', statsController.getAggregatedStats);

module.exports = router;