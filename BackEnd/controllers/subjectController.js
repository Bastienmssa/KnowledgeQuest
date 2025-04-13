// controllers/subjectController.js
const Subject = require('../models/Subject');
const logger = require('../utils/logger');

// Créer une nouvelle matière
exports.createSubject = async (req, res) => {
  try {
    const { name, topics } = req.body;
    
    // Vérifier si la matière existe déjà
    const existingSubject = await Subject.findOne({ name });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà'
      });
    }
    
    // Créer la matière
    const subject = new Subject({
      name,
      topics
    });
    
    await subject.save();
    
    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    logger.error(`Erreur lors de la création de la matière: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la matière',
      error: error.message
    });
  }
};

// Récupérer toutes les matières
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des matières: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des matières',
      error: error.message
    });
  }
};

// Récupérer une matière par son nom
exports.getSubjectByName = async (req, res) => {
  try {
    const subject = await Subject.findOne({ name: req.params.name });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération de la matière: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la matière',
      error: error.message
    });
  }
};

// Mettre à jour une matière
exports.updateSubject = async (req, res) => {
  try {
    const { name, topics } = req.body;
    
    const subject = await Subject.findOneAndUpdate(
      { name: req.params.name },
      { name, topics },
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de la matière: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la matière',
      error: error.message
    });
  }
};