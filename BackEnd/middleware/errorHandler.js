const errorHandler = (err, req, res, next) => {
  // Log l'erreur pour le développement
  console.error(err.stack);

  // Erreurs Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', ')
    });
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Cette valeur existe déjà dans la base de données'
    });
  }

  // Erreur d'ID MongoDB non valide
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Ressource non trouvée'
    });
  }

  // Renvoyer une réponse d'erreur générique
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;