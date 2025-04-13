// controllers/statsController.js
const Stats = require('../models/Stats');
const Session = require('../models/Session');
const logger = require('../utils/logger');

// Récupérer les statistiques d'un utilisateur
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Vérifier que l'utilisateur ne peut voir que ses propres stats
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir les statistiques de cet utilisateur'
      });
    }
    
    let stats = await Stats.findOne({ userId });
    
    // Si aucune stats n'existe, créer une entrée vide
    if (!stats) {
      stats = {
        userId,
        scoresHistory: [],
        averageScore: 0
      };
    }
    
    // Récupérer des données supplémentaires pour enrichir les statistiques
    const sessionsCount = await Session.countDocuments({ userId });
    const subjectPerformance = await Session.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: 'qcms',
          localField: 'qcmId',
          foreignField: '_id',
          as: 'qcm'
        }
      },
      { $unwind: '$qcm' },
      {
        $group: {
          _id: '$qcm.subject',
          averageScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Enrichir l'objet stats avec des données supplémentaires
    const enrichedStats = {
      ...stats._doc || stats,
      sessionsCount,
      subjectPerformance
    };
    
    res.status(200).json({
      success: true,
      data: enrichedStats
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Récupérer des statistiques agrégées (tendances, progrès)
exports.getAggregatedStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer l'évolution hebdomadaire
    const weeklyProgress = await Session.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          averageScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);
    
    // Récupérer les statistiques par sujet
    const subjectStats = await Session.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: 'qcms',
          localField: 'qcmId',
          foreignField: '_id',
          as: 'qcm'
        }
      },
      { $unwind: '$qcm' },
      {
        $group: {
          _id: '$qcm.subject',
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          worstScore: { $min: '$score' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        weeklyProgress,
        subjectStats
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des statistiques agrégées: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques agrégées',
      error: error.message
    });
  }
};