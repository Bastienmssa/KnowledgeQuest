const mongoose = require('mongoose');
const { Schema } = mongoose;

const answeredSchema = new Schema({
  question: {
    type: String,
    default: 'Question non disponible'
  },
  userAnswer: {
    type: String,
    default: '<Aucune>'
  },
  correctAnswer: {
    type: String,
    default: 'Non définie'
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const sessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qcmId: {
    type: Schema.Types.ObjectId,
    ref: 'Qcm',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // Durée en secondes
    required: true
  },
  questionsAnswered: [answeredSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
