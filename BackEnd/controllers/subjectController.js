// controllers/subjectController.js
const Subject = require('../models/Subject');
const logger = require('../utils/logger');

// Créer une nouvelle matière
exports.createSubject = async (req, res) => {
  try {
    const { name, domain, topics } = req.body;

    // Vérifie si la matière existe déjà dans le même domaine
    const existingSubject = await Subject.findOne({ name, domain });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà dans ce domaine'
      });
    }

    const subject = new Subject({ name, domain, topics });
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

// Récupérer toutes les matières (admin/dev)
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
    const { name, domain, topics } = req.body;

    const subject = await Subject.findOneAndUpdate(
      { name: req.params.name, domain },
      { name, domain, topics },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée pour ce domaine'
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

// 🔒 Récupérer tous les topics disponibles pour le domaine de l'utilisateur connecté
exports.getUserTopics = async (req, res) => {
  try {
    const userDomain = req.user.domain;

    const subjects = await Subject.find({ domain: userDomain });
    if (!subjects.length) {
      return res.status(404).json({
        success: false,
        message: 'Aucune matière trouvée pour ce domaine'
      });
    }

    const topics = subjects.flatMap(subject => subject.topics);

    res.status(200).json({
      success: true,
      data: topics
    });
  } catch (error) {
    logger.error(`Erreur chargement des matières domaine utilisateur: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ✅ Récupérer les matières selon un domaine spécifique (publiquement ou filtré)
exports.getSubjectsByDomain = async (req, res) => {
  try {
    const { domain } = req.params;

    const subjects = await Subject.find({ domain });

    if (!subjects.length) {
      return res.status(404).json({
        success: false,
        message: 'Aucune matière trouvée pour ce domaine'
      });
    }

    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    logger.error(`Erreur récupération matières par domaine: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ✅ Récupérer les topics d'une matière spécifique
exports.getTopicsBySubject = async (req, res) => {
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
      topics: subject.topics
    });
  } catch (error) {
    logger.error(`Erreur récupération des topics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
