const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET user settings
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ success: true, settings: user.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT user settings
router.put('/', protect, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { settings: req.body },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ success: true, settings: updated.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
