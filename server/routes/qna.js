const express = require('express');
const router = express.Router();
const { getQuestions, getQuestion, createQuestion, addAnswer, acceptAnswer, upvoteAnswer, deleteQuestion } = require('../controllers/qnaController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getQuestions);
router.get('/:id', protect, getQuestion);
router.post('/', protect, createQuestion);
router.post('/:id/answer', protect, addAnswer);
router.put('/:id/accept/:answerId', protect, acceptAnswer);
router.put('/:id/upvote/:answerId', protect, upvoteAnswer);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;
