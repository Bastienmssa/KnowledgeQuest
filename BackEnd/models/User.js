const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  domain: {
    type: String,
    enum: ['Médecine', 'Droit'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    theme: { type: String, default: 'medicine' },
    fontSize: { type: String, default: 'medium' },
    darkMode: { type: Boolean, default: false },
    notifications: {
      email: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      frequency: { type: String, default: 'weekly' }
    },
    privacy: {
      dataSharing: { type: Boolean, default: true },
      documentRetention: { type: Number, default: 7 }
    },
    study: {
      mode: { type: String, default: 'random' },
      timePerQuestion: { type: Number, default: 30 },
      dailyGoal: { type: Number, default: 20 }
    }
  }
});

// Encrypt password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
