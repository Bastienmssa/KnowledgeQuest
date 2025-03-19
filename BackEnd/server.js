// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const userRoutes = require('./routes/userRoutes');
const qcmRoutes = require('./routes/qcmRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/qcm', qcmRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Knowledge Quest opérationnelle!' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});