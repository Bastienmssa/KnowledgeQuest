// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');


// Routes d'authentification standard
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/me', protect, userController.getMe);

// Routes d'authentification sociale
router.post('/google', userController.googleAuth);
router.post('/microsoft', userController.microsoftAuth);
router.post('/apple', userController.appleAuth);

// Routes de gestion de profil (protégées)
router.put('/update-profile', protect, userController.updateProfile);
router.put('/update-domain', protect, userController.updateDomain);

module.exports = router;