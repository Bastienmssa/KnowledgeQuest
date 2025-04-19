const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const qcmController = require('../controllers/qcmController');

// Toutes les routes nécessitent une authentification
router.use(protect);

// CRUD QCM
router.route('/')
  .post(qcmController.createQcm)
  .get(qcmController.getQcms);

router.route('/:id')
  .get(qcmController.getQcmById)
  .put(qcmController.updateQcm)
  .delete(qcmController.deleteQcm);

// Génération par document
// router.post('/generate', qcmController.generateQcm);

module.exports = router;
