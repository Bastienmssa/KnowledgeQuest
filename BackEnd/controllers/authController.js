const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      passwordHash: password, // laisser le hash au middleware Mongoose
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

// ========== GOOGLE AUTH ==========
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        passwordHash: Math.random().toString(36).slice(-8),
        domain: 'Médecine',
        picture
      });
      await user.save();
    }

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        picture: user.picture
      },
      token: jwtToken,
      needsProfileCompletion: !user.domain
    });
  } catch (error) {
    console.error('Erreur Google Auth:', error);
    res.status(500).json({ success: false, message: 'Erreur Google Auth', error: error.message });
  }
};

// ========== MICROSOFT AUTH ==========
exports.microsoftAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const { displayName, mail, userPrincipalName } = graphResponse.data;
    const email = mail || userPrincipalName;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email introuvable via Microsoft' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: displayName,
        email,
        passwordHash: Math.random().toString(36).slice(-8),
        domain: 'Médecine'
      });
      await user.save();
    }

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
      needsProfileCompletion: !user.domain
    });
  } catch (error) {
    console.error('Erreur Microsoft Auth:', error);
    res.status(500).json({ success: false, message: 'Erreur Microsoft Auth', error: error.message });
  }
};

// ========== APPLE AUTH ==========
exports.appleAuth = async (req, res) => {
  try {
    const { id_token, user: appleUser } = req.body;

    const decodedToken = jwt.decode(id_token);
    const email = decodedToken?.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email introuvable via Apple' });
    }

    const name = appleUser?.name || `Utilisateur ${Math.floor(Math.random() * 10000)}`;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        passwordHash: Math.random().toString(36).slice(-8),
        domain: 'Médecine'
      });
      await user.save();
    }

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
      needsProfileCompletion: !user.domain
    });
  } catch (error) {
    console.error('Erreur Apple Auth:', error);
    res.status(500).json({ success: false, message: 'Erreur Apple Auth', error: error.message });
  }
};
