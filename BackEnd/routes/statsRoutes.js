const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const statsController = require('../controllers/statsController');

// Protéger toutes les routes
router.use(protect);

// Routes statistiques principales
router.get('/:userId?', statsController.getUserStats);             // statistiques de l'utilisateur
router.get('/aggregated/data', statsController.getAggregatedStats); // tendances globales

module.exports = router;
