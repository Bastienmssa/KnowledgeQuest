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
      score: {
        type: Number,
        required: true
      }
    }
  ],
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stats', StatsSchema);
