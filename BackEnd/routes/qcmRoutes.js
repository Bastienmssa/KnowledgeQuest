const express = require('express');
const Qcm = require('../models/Qcm');
const router = express.Router();

// @desc    Create a new QCM
// @route   POST /api/qcms
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, subject, questions, createdBy } = req.body;
    const qcm = await Qcm.create({ title, subject, questions, createdBy });
    res.status(201).json(qcm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all QCMs
// @route   GET /api/qcms
// @access  Private
router.get('/', async (req, res) => {
  try {
    const qcms = await Qcm.find({});
    res.json(qcms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get QCM by id
// @route   GET /api/qcms/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const qcm = await Qcm.findById(req.params.id);
    if (!qcm) {
      return res.status(404).json({ message: 'QCM not found' });
    }
    res.json(qcm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get QCMs by subject
// @route   GET /api/qcms/subject/:subject
// @access  Private
router.get('/subject/:subject', async (req, res) => {
  try {
    const qcms = await Qcm.find({ subject: req.params.subject });
    res.json(qcms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;