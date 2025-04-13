// controllers/userController.js
const User = require('../models/User');
const { generateToken } = require('./authController');

// Mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const { name, domain } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (domain) updateData.domain = domain;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain
      }
    });
  } catch (error) {
    console.error('Erreur de mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// Mettre à jour spécifiquement le domaine d'étude
exports.updateDomain = async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez spécifier un domaine'
      });
    }
    
    if (!['Médecine', 'Droit'].includes(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Le domaine doit être "Médecine" ou "Droit"'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { domain },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain
      }
    });
  } catch (error) {
    console.error('Erreur de mise à jour du domaine:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du domaine',
      error: error.message
    });
  }
};

// Récupérer tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Erreur de récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Ces méthodes sont réexportées depuis authController pour compatibilité
exports.registerUser = require('./authController').register;
exports.loginUser = require('./authController').login;
exports.getMe = require('./authController').getMe;
exports.googleAuth = require('./authController').googleAuth;
exports.microsoftAuth = require('./authController').microsoftAuth;
exports.appleAuth = require('./authController').appleAuth;