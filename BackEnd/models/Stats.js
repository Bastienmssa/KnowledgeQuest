const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  scoresHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    score: Number,
    qcmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Qcm'
    }
  }],
  averageScore: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Stats', StatsSchema);