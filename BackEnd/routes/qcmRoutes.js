const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Qcm = require('../models/Qcm');

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accepter uniquement les PDF et DOCX
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Utilisez PDF ou DOCX.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB max
  },
  fileFilter: fileFilter
});

// @desc    Charger un document et générer des QCM
// @route   POST /api/qcm/generate
// @access  Private
router.post('/generate', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Veuillez télécharger un document' });
    }
    
    // Ici, vous appelleriez l'API d'IA pour analyser le document
    // Pour l'instant, nous allons simuler une réponse

    // Exemple de QCM généré
    const generatedQcm = {
      title: req.file.originalname.split('.')[0],
      subject: req.body.subject || 'Général',
      questions: [
        {
          question: "Exemple de question générée automatiquement",
          choices: ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
          correctAnswer: "Choix 2"
        }
      ],
      createdBy: req.user._id
    };
    
    // Enregistrement du QCM généré
    const qcm = await Qcm.create(generatedQcm);
    
    res.status(201).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Créer un nouveau QCM manuellement
// @route   POST /api/qcm
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, subject, questions } = req.body;
    
    // Vérification des données
    if (!title || !subject || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Veuillez fournir un titre, une matière et au moins une question' 
      });
    }
    
    const qcm = await Qcm.create({
      title,
      subject,
      questions,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Obtenir tous les QCM de l'utilisateur
// @route   GET /api/qcm
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const qcms = await Qcm.find({ createdBy: req.user._id });
    
    res.status(200).json({
      success: true,
      count: qcms.length,
      data: qcms
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Obtenir un QCM spécifique
// @route   GET /api/qcm/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const qcm = await Qcm.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({ success: false, error: 'QCM non trouvé' });
    }
    
    // Vérifier si l'utilisateur est bien le propriétaire du QCM
    if (qcm.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Non autorisé à accéder à ce QCM' });
    }
    
    res.status(200).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Modifier un QCM
// @route   PUT /api/qcm/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let qcm = await Qcm.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({ success: false, error: 'QCM non trouvé' });
    }
    
    // Vérifier si l'utilisateur est bien le propriétaire du QCM
    if (qcm.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Non autorisé à modifier ce QCM' });
    }
    
    qcm = await Qcm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Supprimer un QCM
// @route   DELETE /api/qcm/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const qcm = await Qcm.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({ success: false, error: 'QCM non trouvé' });
    }
    
    // Vérifier si l'utilisateur est bien le propriétaire du QCM
    if (qcm.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Non autorisé à supprimer ce QCM' });
    }
    
    await qcm.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;