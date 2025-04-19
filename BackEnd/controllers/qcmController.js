const Qcm = require('../models/Qcm');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Créer un nouveau QCM
const createQcm = async (req, res) => {
  try {
    const { title, subject, topic, questions } = req.body;

    if (!title || !subject || !topic || !questions?.length) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un titre, une matière, un thème et des questions.'
      });
    }

    const userDomain = req.user.domain;

    const subjectDoc = await Subject.findOne({ name: subject });
    if (!subjectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Matière introuvable'
      });
    }

    if (subjectDoc.domain !== userDomain) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez créer un QCM que dans votre domaine'
      });
    }

    const qcm = await Qcm.create({
      title,
      subject,
      topic,
      domain: userDomain,
      questions,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    logger.error(`Erreur lors de la création du QCM: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du QCM',
      error: error.message
    });
  }
};

const getQcms = async (req, res) => {
  try {
    const query = {};

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

const getQcmById = async (req, res) => {
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
      return res.status(400).json({ success: false, message: 'ID de QCM invalide' });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du QCM',
      error: error.message
    });
  }
};

const updateQcm = async (req, res) => {
  try {
    const { title, subject, topic, questions } = req.body;
    const qcm = await Qcm.findById(req.params.id);

    if (!qcm) {
      return res.status(404).json({ success: false, message: 'QCM non trouvé' });
    }

    if (qcm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce QCM'
      });
    }

    const subjectDoc = await Subject.findOne({ name: subject });
    if (!subjectDoc || subjectDoc.domain !== req.user.domain) {
      return res.status(403).json({
        success: false,
        message: 'La matière ne correspond pas à votre domaine'
      });
    }

    qcm.title = title || qcm.title;
    qcm.subject = subject || qcm.subject;
    qcm.topic = topic || qcm.topic;
    qcm.questions = questions || qcm.questions;

    await qcm.save();

    res.status(200).json({
      success: true,
      data: qcm
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du QCM: ${error.message}`);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour',
      error: error.message
    });
  }
};

const deleteQcm = async (req, res) => {
  try {
    const qcm = await Qcm.findById(req.params.id);

    if (!qcm) {
      return res.status(404).json({ success: false, message: 'QCM non trouvé' });
    }

    if (qcm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce QCM'
      });
    }

    await qcm.remove();

    res.status(200).json({
      success: true,
      message: 'QCM supprimé avec succès'
    });
  } catch (error) {
    logger.error(`Erreur suppression QCM: ${error.message}`);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Export des fonctions correctement
module.exports = {
  createQcm,
  getQcms,
  getQcmById,
  updateQcm,
  deleteQcm
};
