const mongoose = require('mongoose');

const QcmSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject']
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      choices: {
        type: [String],
        required: true
      },
      correctAnswer: {
        type: String,
        required: true
      }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Qcm', QcmSchema);