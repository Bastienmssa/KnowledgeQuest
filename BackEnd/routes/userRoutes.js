// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMe,
  updateProfile,
  updateDomain,
  updatePassword,
  getTestHistory,
  getAllUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// 📌 Routes utilisateur authentifié
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/domain', protect, updateDomain);
router.put('/password', protect, updatePassword);
router.get('/test-history', protect, getTestHistory);

// 🔒 Routes admin
router.get('/all', protect, getAllUsers);

module.exports = router;
