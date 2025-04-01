const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    enum: ['Médecine', 'Droit']
  },
  topics: {
    type: [String],
    required: true
  }
});

module.exports = mongoose.model('Subject', SubjectSchema);