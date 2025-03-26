const mongoose = require('mongoose');
const logger = require('./logger');
const databaseConfig = require('../config/database');

const connectDB = async () => {
  try {
    // Connexion à MongoDB avec les options simplifiées
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Erreur de connexion à MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;