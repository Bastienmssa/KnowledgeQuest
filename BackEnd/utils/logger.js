const winston = require('winston');
const path = require('path');

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Configuration des transports
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: customFormat,
  transports: [
    // Écrire tous les logs dans console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    // Écrire tous les logs dans combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    }),
    // Écrire les erreurs dans error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    })
  ]
});

module.exports = logger;