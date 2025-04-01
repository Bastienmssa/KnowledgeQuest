const express = require('express');
const Subject = require('../models/Subject');
const router = express.Router();

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const { name, topics } = req.body;
    const subject = await Subject.create({ name, topics });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find({});
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get subject by name
// @route   GET /api/subjects/:name
// @access  Private
router.get('/:name', async (req, res) => {
  try {
    const subject = await Subject.findOne({ name: req.params.name });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;