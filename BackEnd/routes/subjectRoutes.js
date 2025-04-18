const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const subjectController = require('../controllers/subjectController');

// 📌 ROUTES PUBLIQUES (ex: dev/admin ou affichage global si besoin)
router.get('/all', subjectController.getAllSubjects); // toutes les matières
router.get('/topics/:name', subjectController.getTopicsBySubject); // topics d'une matière
router.get('/domain/:domain', subjectController.getSubjectsByDomain); // matières par domaine
router.get('/:name', subjectController.getSubjectByName); // matière par nom

// 🔒 ROUTES PROTÉGÉES (utilisateur connecté requis)
router.use(protect);

// 🔐 Récupérer tous les topics disponibles pour le domaine de l'utilisateur
router.get('/', subjectController.getUserTopics);

// 🔐 Admin : créer ou modifier une matière
router.post('/', subjectController.createSubject);
router.put('/:name', subjectController.updateSubject);

module.exports = router;
