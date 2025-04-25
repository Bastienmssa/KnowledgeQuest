const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const admin = require('../utils/firebaseAdmin');
const querystring = require('querystring');

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
    if (!user || !(await user.matchPassword(password))) {
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
    const { token, domain } = req.body;
    const decoded = await admin.auth().verifyIdToken(token);
    const { name, email, picture } = decoded;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email non trouvé dans le token' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || 'Utilisateur Google',
        email,
        passwordHash: Math.random().toString(36).slice(-8),
        domain: domain || 'Médecine',
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
exports.microsoftRedirect = (req, res) => {
  const rawState = req.query.state || 'Médecine';

  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_REDIRECT_URI) {
    return res.status(500).send('Client ID ou Redirect URI manquant.');
  }

  const params = querystring.stringify({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
    response_mode: 'query',
    scope: 'openid profile email',
    state: encodeURIComponent(rawState)
  });

  res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`);
};

exports.microsoftCallback = async (req, res) => {
  try {
    console.log("🟡 Callback Microsoft reçu");
    const code = req.query.code;
    const rawState = req.query.state || 'Médecine';

    console.log("🔍 Code reçu:", code);
    console.log("🔍 State brut reçu:", rawState);

    if (!code) return res.redirect('/register.html?error=missing_code');

    let domain;
    try {
      domain = decodeURIComponent(decodeURIComponent(rawState));
    } catch (e) {
      console.warn("⚠️ Erreur de décodage de state, fallback sur 'Médecine'");
      domain = 'Médecine';
    }

    console.log("🎓 Domaine utilisé:", domain);

    const tokenRes = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      querystring.stringify({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        scope: 'openid profile email',
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const { displayName, mail, userPrincipalName } = userRes.data;
    const email = mail || userPrincipalName;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: displayName,
        email,
        passwordHash: Math.random().toString(36).slice(-8),
        domain
      });
      await user.save();
    }

    const jwtToken = generateToken(user._id);
    res.redirect(`http://localhost:5500/dashboard.html?token=${jwtToken}`);
  } catch (error) {
    console.error("❌ Erreur OAuth Microsoft :", error);
    res.redirect(`http://localhost:5500/register.html?error=oauth`);
  }
};
