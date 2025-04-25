// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Routes d'authentification standard
router.post('/register', authController.register); // Vérifiez que cette fonction existe
router.post('/login', authController.login); // Vérifiez que cette fonction existe
//router.get('/me', protect, authController.getMe);

// Routes d'authentification sociale
router.post('/google', authController.googleAuth);
// router.post('/microsoft', userController.microsoftAuth);
// router.post('/apple', userController.appleAuth);

// Routes de gestion de profil (protégées)
router.put('/update-profile', protect, userController.updateProfile);
router.put('/update-domain', protect, userController.updateDomain);

module.exports = router;