// controllers/userController.js
const User = require('../models/User');
const { generateToken } = require('./authController');

// Récupérer le profil de l'utilisateur connecté
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour le profil (nom, domaine, etc.)
exports.updateProfile = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (domain) updateData.domain = domain;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
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
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

// Mise à jour spécifique du domaine
exports.updateDomain = async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain || !['Médecine', 'Droit'].includes(domain)) {
      return res.status(400).json({ success: false, message: 'Domaine invalide ou manquant' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { domain }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
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
    res.status(500).json({ success: false, message: 'Erreur de mise à jour du domaine', error: error.message });
  }
};

// Récupérer tous les utilisateurs (admin uniquement)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};
