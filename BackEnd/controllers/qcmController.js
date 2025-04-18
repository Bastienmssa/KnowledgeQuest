const Qcm = require('../models/Qcm');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Créer un nouveau QCM (protégé par domaine utilisateur)
exports.createQcm = async (req, res) => {
  try {
    const { title, subject, questions } = req.body;

    if (!title || !subject || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un titre, une matière et au moins une question'
      });
    }

    // Vérifier si la matière appartient au domaine de l'utilisateur
    const userDomain = req.user.domain;
    const subjectDoc = await Subject.findOne({ name: userDomain });

    if (!subjectDoc || !subjectDoc.topics.includes(subject)) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez créer un QCM que dans votre domaine'
      });
    }

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

exports.getQcms = async (req, res) => {
  try {
    let query = {};

    if (req.query.subject) query.subject = req.query.subject;
    if (req.query.createdBy) query.createdBy = req.query.createdBy;

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

exports.updateQcm = async (req, res) => {
  try {
    const { title, subject, questions } = req.body;
    const qcm = await Qcm.findById(req.params.id);

    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }

    if (qcm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce QCM'
      });
    }

    // Protection domaine : empêche de modifier vers un autre domaine
    const userDomain = req.user.domain;
    const subjectDoc = await Subject.findOne({ name: userDomain });

    if (!subjectDoc || !subjectDoc.topics.includes(subject)) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier un QCM que dans votre domaine'
      });
    }

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

exports.deleteQcm = async (req, res) => {
  try {
    const qcm = await Qcm.findById(req.params.id);

    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }

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

exports.generateQcm = async (req, res) => {
  try {
    const { documentId, subject } = req.body;

    if (!documentId || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un ID de document et une matière'
      });
    }

    const userDomain = req.user.domain;
    const subjectDoc = await Subject.findOne({ name: userDomain });

    if (!subjectDoc || !subjectDoc.topics.includes(subject)) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez générer un QCM que dans votre domaine'
      });
    }

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
