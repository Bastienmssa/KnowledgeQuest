const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const admin = require('../firebaseAdmin'); // 🔥 Firebase Admin pour Google Auth

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ========== REGISTER ==========
exports.register = async (req, res) => {
  try {
    const { name, email, password, domain } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      domain
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        settings: user.settings
      },
      token
    });
  } catch (error) {
    console.error('Erreur d\'inscription :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ========== LOGIN ==========
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        settings: user.settings
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ========== GOOGLE AUTH avec Firebase ==========
exports.googleAuth = async (req, res) => {
  try {
    const { token, domain } = req.body;

    if (!token || !domain) {
      return res.status(400).json({ success: false, message: "Token ou domaine manquant." });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { name, email } = decodedToken;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Informations utilisateur incomplètes." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ success: false, message: "Utilisateur déjà existant." });
    }

    const user = new User({
      name,
      email,
      passwordHash: "password123456789",
      domain
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Utilisateur Google créé avec succès.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain
      }
    });
  } catch (error) {
    console.error("Erreur Firebase Google Auth:", error);
    res.status(500).json({ success: false, message: "Erreur Google Firebase Auth", error: error.message });
  }
};
