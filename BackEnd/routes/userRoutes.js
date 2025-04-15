// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMe,
  updateProfile,
  updateDomain,
  getAllUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Routes utilisateurs protégées
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/domain', protect, updateDomain);

// Route admin pour voir tous les utilisateurs (à sécuriser plus tard)
router.get('/all', protect, getAllUsers);

module.exports = router;
