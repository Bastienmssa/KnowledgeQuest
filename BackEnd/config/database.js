const mongoose = require('mongoose');

const databaseConfig = {
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 45000,
    // Les options suivantes ne sont plus supportées et ont été supprimées:
    // keepAlive, keepAliveInitialDelay, debug
    
    // Utilisez plutôt:
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  }
};

module.exports = databaseConfig;