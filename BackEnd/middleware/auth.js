const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ajouter l'utilisateur à la requête
      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Non autorisé, token manquant' });
  }
};