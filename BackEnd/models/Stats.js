const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scoresHistory: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      score: Number
    }
  ],
  averageScore: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Stats', StatsSchema);