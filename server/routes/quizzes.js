const express = require('express');
const protect = require('../middleware/auth');
const { getSubjects, getQuizzes, getQuiz } = require('../controllers/quizController');

const router = express.Router();

router.get('/subjects', protect, getSubjects);
router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);

module.exports = router;
