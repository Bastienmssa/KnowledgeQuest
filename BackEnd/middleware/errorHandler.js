const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Journaliser l'erreur
  logger.error(`${err.name}: ${err.message}`);
  
  // Erreurs MongoDB/Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages
    });
  }
  
  // Erreur d'ID Mongoose
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      error: `Ressource non trouvée: ${err.value}`
    });
  }
  
  // Erreur de duplicata
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Cette entrée existe déjà dans la base de données'
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré. Veuillez vous reconnecter.'
    });
  }
  
  // Erreur Multer
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Erreur d'upload: ${err.message}`
    });
  }
  
  // Erreur de serveur par défaut
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur'
  });
};

module.exports = errorHandler;