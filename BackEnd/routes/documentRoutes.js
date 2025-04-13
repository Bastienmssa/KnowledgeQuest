const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const documentController = require('../controllers/documentController');

// Protéger toutes les routes
router.use(protect);

// Routes pour la gestion des documents
router.post('/upload', documentController.uploadDocument, documentController.processUpload);
router.get('/download/:filename', documentController.downloadDocument);

module.exports = router;