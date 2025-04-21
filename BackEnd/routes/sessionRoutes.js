const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

// Toutes les routes sont protégées
router.use(protect);

// ➕ Créer une session (test QCM passé)
router.post('/', sessionController.createSession);

// 📄 Voir une session spécifique
router.get('/:id', sessionController.getSessionById);

// 📋 Voir toutes les sessions de l'utilisateur connecté OU de l'utilisateur donné (si admin)
router.get('/user/:userId?', sessionController.getUserSessions);

module.exports = router;
