const mongoose = require('mongoose');

const QcmSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'La matière est requise']
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    choices: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v.length >= 2; // Au moins 2 choix
        },
        message: 'Un QCM doit avoir au moins 2 choix de réponses'
      }
    },
    correctAnswer: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return this.choices.includes(v);
        },
        message: 'La réponse correcte doit être parmi les choix'
      }
    }
  }],
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