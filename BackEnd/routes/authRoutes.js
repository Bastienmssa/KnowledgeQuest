const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Routes d'authentification standard
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route Google OAuth avec Firebase Admin
router.post('/google', authController.googleAuth);

// Routes de gestion de profil (protégées)
router.put('/update-profile', protect, userController.updateProfile);
router.put('/update-domain', protect, userController.updateDomain);

module.exports = router;