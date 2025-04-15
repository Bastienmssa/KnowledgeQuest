// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Client Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Authentification standard - Inscription
exports.register = async (req, res) => {
  try {
    const { name, email, password, domain } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      passwordHash,
      domain
    });

    if (user) {
      // Générer un token JWT
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          domain: user.domain
        },
        token
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Données utilisateur invalides'
      });
    }
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Authentification standard - Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer un token JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain
      },
      token
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Authentification Google
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Vérifier le token avec l'API Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { name, email, picture } = payload;
    
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    
    if (!user) {
      // Créer un nouvel utilisateur
      user = new User({
        name,
        email,
        passwordHash: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        domain: 'Médecine', // Valeur par défaut
        picture: picture
      });
      
      await user.save();
    }
    
    // Générer un token JWT
    const jwtToken = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        picture: user.picture || picture
      },
      token: jwtToken,
      needsProfileCompletion: !user.domain || user.domain === 'Médecine'
    });
  } catch (error) {
    console.error('Erreur d\'authentification Google:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification Google',
      error: error.message
    });
  }
};

// Authentification Microsoft
exports.microsoftAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    // Récupérer les informations utilisateur depuis Microsoft Graph API
    const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const { displayName, mail, userPrincipalName } = graphResponse.data;
    const email = mail || userPrincipalName;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de récupérer l\'email depuis Microsoft'
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    
    if (!user) {
      // Créer un nouvel utilisateur
      user = new User({
        name: displayName,
        email,
        passwordHash: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        domain: 'Médecine' // Valeur par défaut
      });
      
      await user.save();
    }
    
    // Générer un token JWT
    const jwtToken = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain
      },
      token: jwtToken,
      needsProfileCompletion: !user.domain || user.domain === 'Médecine'
    });
  } catch (error) {
    console.error('Erreur d\'authentification Microsoft:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification Microsoft',
      error: error.message
    });
  }
};

// Authentification Apple
exports.appleAuth = async (req, res) => {
  try {
    const { id_token, user: appleUser } = req.body;
    
    // Décoder le token pour obtenir l'email
    const decodedToken = jwt.decode(id_token);
    const email = decodedToken.email;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de récupérer l\'email depuis Apple'
      });
    }
    
    // Utiliser le nom fourni ou générer un nom par défaut
    const name = appleUser?.name || `Utilisateur ${Math.floor(Math.random() * 10000)}`;
    
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    
    if (!user) {
      // Créer un nouvel utilisateur
      user = new User({
        name,
        email,
        passwordHash: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        domain: 'Médecine' // Valeur par défaut
      });
      
      await user.save();
    }
    
    // Générer un token JWT
    const jwtToken = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain
      },
      token: jwtToken,
      needsProfileCompletion: !user.domain || user.domain === 'Médecine'
    });
  } catch (error) {
    console.error('Erreur d\'authentification Apple:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification Apple',
      error: error.message
    });
  }
};
