const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Stats = require('../models/Stats');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    S'inscrire comme nouvel utilisateur
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, domain } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Utilisateur déjà existant' });
    }

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password,
      domain
    });

    // Créer un document stats vide pour l'utilisateur
    await Stats.create({
      userId: user._id,
      scoresHistory: [],
      averageScore: 0
    });

    // Répondre avec le token
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      domain: user.domain,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Authentifier un utilisateur
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que l'email et le password sont fournis
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Veuillez fournir un email et un mot de passe' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Email ou mot de passe invalide' });
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Email ou mot de passe invalide' });
    }

    // Répondre avec le token
    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      domain: user.domain,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Obtenir le profil utilisateur
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      domain: user.domain
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};