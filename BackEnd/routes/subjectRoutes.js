const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const subjectController = require('../controllers/subjectController');

// Routes publiques
router.get('/', subjectController.getAllSubjects);
router.get('/:name', subjectController.getSubjectByName);

// Routes protégées (admin)
router.use(protect);

router.post('/', subjectController.createSubject);
router.put('/:name', subjectController.updateSubject);

module.exports = router;