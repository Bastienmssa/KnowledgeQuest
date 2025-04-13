// controllers/documentController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que certains types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Veuillez télécharger un fichier PDF, Word ou TXT.'));
  }
};

// Configuration de l'upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Mo
  }
});

// Middleware pour le téléchargement de fichier
exports.uploadDocument = upload.single('document');

// Contrôleur pour traiter le téléchargement
exports.processUpload = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier n\'a été téléchargé'
        });
      }
      
      // Créer une entrée de document dans la base de données
      const document = new Document({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        userId: req.user.id
      });
      
      await document.save();
      
      // Ici, vous pourriez intégrer l'appel à l'API d'IA pour analyser le document
      
      res.status(200).json({
        success: true,
        message: 'Document téléchargé avec succès',
        data: document
      });
    } catch (error) {
      logger.error(`Erreur lors du traitement du document: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du traitement du document',
        error: error.message
      });
    }
  };

// Télécharger un document généré
exports.downloadDocument = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../uploads', filename);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }
    
    res.download(filepath);
  } catch (error) {
    logger.error(`Erreur lors du téléchargement du document: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du document',
      error: error.message
    });
  }
};