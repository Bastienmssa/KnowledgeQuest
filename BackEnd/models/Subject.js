const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veuillez ajouter un nom de matière']
  },
  domain: {
    type: String,
    required: [true, 'Veuillez spécifier le domaine (ex: Médecine, Droit)'],
    enum: ['Médecine', 'Droit']
  },
  topics: {
    type: [String],
    required: true
  }
});

module.exports = mongoose.model('Subject', SubjectSchema);
