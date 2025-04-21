const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// 🔐 Récupérer les infos du profil connecté
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    logger.error(`Erreur getMe: ${err.message}`);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

// 🔄 Mettre à jour les informations personnelles
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, domain, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (domain) user.domain = domain;
    if (avatar && ['homme.png', 'fille.png'].includes(avatar)) {
      user.avatar = avatar;
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    logger.error(`Erreur updateProfile: ${err.message}`);
    res.status(500).json({ success: false, message: 'Erreur mise à jour profil', error: err.message });
  }
};

// 🔐 Changer le mot de passe
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(403).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err) {
    logger.error(`Erreur updatePassword: ${err.message}`);
    res.status(500).json({ success: false, message: 'Erreur mise à jour mot de passe', error: err.message });
  }
};

// 🧠 Récupérer l'historique des tests
exports.getTestHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('scoresHistory');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    res.status(200).json({ success: true, data: user.scoresHistory || [] });
  } catch (err) {
    logger.error(`Erreur getTestHistory: ${err.message}`);
    res.status(500).json({ success: false, message: 'Erreur chargement historique', error: err.message });
  }
};

// 🔄 Mettre à jour uniquement le domaine
exports.updateDomain = async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain || !['Médecine', 'Droit'].includes(domain)) {
      return res.status(400).json({ success: false, message: 'Domaine invalide' });
    }

    const user = await User.findById(req.user.id);
    user.domain = domain;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    logger.error(`Erreur updateDomain: ${err.message}`);
    res.status(500).json({ success: false, message: 'Erreur mise à jour domaine', error: err.message });
  }
};

// 🔒 Admin : liste des utilisateurs
exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    logger.error(`Erreur getAllUsers: ${err.message}`);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};
