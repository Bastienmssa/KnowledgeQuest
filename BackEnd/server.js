const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./utils/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Création des dossiers nécessaires s'ils n'existent pas
const dirs = ['logs', 'uploads'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration des variables d'environnement
dotenv.config();

// Routes
const userRoutes = require('./routes/userRoutes');
const qcmRoutes = require('./routes/qcmRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Accès aux dossiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
connectDB()
  .then(() => logger.info('Base de données connectée et prête'))
  .catch(err => {
    logger.error(`Erreur d'initialisation de la BD: ${err.message}`);
    // En développement, continuer même en cas d'erreur MongoDB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/qcm', qcmRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

// Route pour tester si l'API est en ligne
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API KnowledgeQuest opérationnelle!',
    timestamp: new Date().toISOString()
  });
});

// Route racine pour indiquer que l'API est en ligne
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>KnowledgeQuest API</title></head>
      <body>
        <h1>KnowledgeQuest API</h1>
        <p>L'API est en ligne et fonctionne correctement.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion des routes inconnues
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route introuvable' });
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  logger.info(`Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`);
  logger.info(`URL de l'API: http://localhost:${PORT}`);
});

// Gestion des erreurs non interceptées
process.on('unhandledRejection', (err) => {
  logger.error(`ERREUR NON GÉRÉE: ${err.message}`);
  console.error(err.stack);
  // Fermer proprement le serveur avant de quitter
  server.close(() => process.exit(1));
});

// Permettre l'arrêt propre
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, fermeture du serveur...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('Connexion MongoDB fermée. Arrêt du processus.');
      process.exit(0);
    });
  });
});

module.exports = app;