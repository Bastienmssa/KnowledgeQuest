const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qcmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Qcm',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  questionsAnswered: [
    {
      question: String,
      userAnswer: String,
      isCorrect: Boolean
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);