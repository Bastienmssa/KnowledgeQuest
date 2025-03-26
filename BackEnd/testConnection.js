const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./utils/db');
const logger = require('./utils/logger');

// Charger variables d'environnement
dotenv.config();

const testConnection = async () => {
  try {
    logger.info('Test de connexion à MongoDB...');
    
    // Connexion à la BD
    await connectDB();
    logger.info('✅ Connexion à MongoDB réussie!');
    
    // Tenter une simple opération
    const TestModel = mongoose.model('TestConnection', new mongoose.Schema({
      testField: String,
      createdAt: { type: Date, default: Date.now }
    }));
    
    // Créer un document de test
    const testDoc = await TestModel.create({ testField: 'Test de connexion réussi' });
    logger.info(`✅ Document créé avec succès: ${testDoc._id}`);
    
    // Lire le document
    const foundDoc = await TestModel.findById(testDoc._id);
    logger.info(`✅ Document récupéré avec succès: ${foundDoc.testField}`);
    
    // Mettre à jour le document
    const updatedDoc = await TestModel.findByIdAndUpdate(
      testDoc._id,
      { testField: 'Document mis à jour' },
      { new: true }
    );
    logger.info(`✅ Document mis à jour avec succès: ${updatedDoc.testField}`);
    
    // Supprimer le document
    await TestModel.findByIdAndDelete(testDoc._id);
    logger.info('✅ Document supprimé avec succès');
    
    // Nettoyage final
    await mongoose.connection.dropCollection('testconnections');
    logger.info('✅ Collection de test nettoyée');
    
    // Fermer la connexion
    await mongoose.connection.close();
    logger.info('✅ Test terminé avec succès. Votre base de données est correctement configurée!');
    
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Test échoué: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
};

// Exécuter le test
testConnection();