const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const qcmController = require('../controllers/qcmController');

// Routes publiques (aucune)

// Routes protégées
router.use(protect);

// Routes pour la gestion des QCM
router.route('/')
  .post(qcmController.createQcm)
  .get(qcmController.getQcms);

router.route('/:id')
  .get(qcmController.getQcmById)
  .put(qcmController.updateQcm)
  .delete(qcmController.deleteQcm);

// Route pour générer un QCM à partir d'un document
router.post('/generate', qcmController.generateQcm);

// Route pour récupérer les QCM par matière
router.get('/subject/:subject', qcmController.getQcms);

module.exports = router;