const Stats = require('../models/Stats');
const Session = require('../models/Session');
const logger = require('../utils/logger');

// 📊 Récupérer les statistiques individuelles d’un utilisateur
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Sécurité : ne pas accéder aux stats d’un autre sans droits
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir les statistiques de cet utilisateur'
      });
    }

    // Récupération ou initialisation des stats
    let stats = await Stats.findOne({ userId });
    if (!stats) {
      stats = {
        userId,
        scoresHistory: [],
        averageScore: 0
      };
    }

    // Sessions totales terminées
    const sessionsCount = await Session.countDocuments({ userId });

    // Moyennes par matière
    const subjectPerformance = await Session.aggregate([
      { $match: { userId } },
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

    // Fusion des données
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

// 📈 Récupérer les statistiques agrégées (par matière + historique)
exports.getAggregatedStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 📅 Évolution des scores dans le temps (par date)
    const weeklyProgress = await Session.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          averageScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 📚 Répartition des performances par matière
    const subjectStats = await Session.aggregate([
      { $match: { userId } },
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
