const express = require('express');
const router = express.Router();
const { getQuizzes, getQuiz, createQuiz, submitQuiz, updateQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/', protect, roleCheck('teacher'), createQuiz);
router.post('/:id/submit', protect, roleCheck('student'), submitQuiz);
router.put('/:id', protect, roleCheck('teacher'), updateQuiz);
router.delete('/:id', protect, roleCheck('teacher'), deleteQuiz);

module.exports = router;
