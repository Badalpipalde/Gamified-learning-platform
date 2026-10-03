const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const validate = require('../middleware/validate');
const { getGameQuestions, submitGameScore } = require('../controllers/gamesController');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/:gameSlug/questions', getGameQuestions);

router.post(
  '/submit',
  [
    body('gameSlug').trim().notEmpty().withMessage('Game slug is required'),
    body('xpEarned').isInt({ min: 0 }).withMessage('XP earned must be a non-negative integer'),
    body('correctAnswers').isInt({ min: 0 }),
    body('totalQuestions').isInt({ min: 1 }),
  ],
  validate,
  submitGameScore
);

module.exports = router;
