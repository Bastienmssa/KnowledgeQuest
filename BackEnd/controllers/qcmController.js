// controllers/qcmController.js
const Qcm = require('../models/Qcm');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Créer un nouveau QCM
exports.createQcm = async (req, res) => {
  try {
    const { title, subject, questions } = req.body;
    
    // Valider les données
    if (!title || !subject || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un titre, une matière et au moins une question'
      });
    }
    
    // Ajouter l'ID de l'utilisateur connecté
    const qcm = new Qcm({
      title,
      subject,
      questions,
      createdBy: req.user.id
    });
    
    await qcm.save();
    
    res.status(201).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    logger.error(`Erreur lors de la création du QCM: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du QCM',
      error: error.message
    });
  }
};

// Récupérer tous les QCM (avec filtres optionnels)
exports.getQcms = async (req, res) => {
  try {
    let query = {};
    
    // Filtre par matière
    if (req.query.subject) {
      query.subject = req.query.subject;
    }
    
    // Filtre par créateur
    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }
    
    // Exécuter la requête
    const qcms = await Qcm.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: qcms.length,
      data: qcms
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des QCM: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des QCM',
      error: error.message
    });
  }
};

// Récupérer un QCM par ID
exports.getQcmById = async (req, res) => {
  try {
    const qcm = await Qcm.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du QCM: ${error.message}`);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: 'ID de QCM invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du QCM',
      error: error.message
    });
  }
};

// Mettre à jour un QCM
exports.updateQcm = async (req, res) => {
  try {
    const { title, subject, questions } = req.body;
    
    // Trouver et mettre à jour le QCM
    let qcm = await Qcm.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est le créateur du QCM
    if (qcm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce QCM'
      });
    }
    
    // Mettre à jour les champs
    qcm.title = title || qcm.title;
    qcm.subject = subject || qcm.subject;
    qcm.questions = questions || qcm.questions;
    
    await qcm.save();
    
    res.status(200).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du QCM: ${error.message}`);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: 'ID de QCM invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du QCM',
      error: error.message
    });
  }
};

// Supprimer un QCM
exports.deleteQcm = async (req, res) => {
  try {
    const qcm = await Qcm.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est le créateur du QCM
    if (qcm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce QCM'
      });
    }
    
    await qcm.remove();
    
    res.status(200).json({
      success: true,
      message: 'QCM supprimé avec succès'
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression du QCM: ${error.message}`);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: 'ID de QCM invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du QCM',
      error: error.message
    });
  }
};

// Générer un QCM à partir d'un document (fonctionnalité IA)
exports.generateQcm = async (req, res) => {
  try {
    // Ici vous pourriez implémenter l'appel à l'API d'IA
    // Pour l'instant, nous allons simuler une réponse
    
    const { documentId, subject } = req.body;
    
    if (!documentId || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un ID de document et une matière'
      });
    }
    
    // Ici, vous appelleriez votre API d'IA pour analyser le document
    // et générer des questions
    
    // Simulation de questions générées
    const generatedQuestions = [
      {
        question: "Question générée par IA 1",
        choices: ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
        correctAnswer: "Choix 2"
      },
      {
        question: "Question générée par IA 2",
        choices: ["Choix A", "Choix B", "Choix C", "Choix D"],
        correctAnswer: "Choix C"
      }
    ];
    
    // Créer le QCM avec les questions générées
    const qcm = new Qcm({
      title: `QCM généré - ${new Date().toLocaleDateString()}`,
      subject,
      questions: generatedQuestions,
      createdBy: req.user.id
    });
    
    await qcm.save();
    
    res.status(201).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    logger.error(`Erreur lors de la génération du QCM: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du QCM',
      error: error.message
    });
  }
};