const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const validate = require('../middleware/validate');
const { submitAttempt, getMyAttempts } = require('../controllers/attemptController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('quizId').isMongoId().withMessage('Valid quiz ID required'),
    body('answers').isArray({ min: 1 }).withMessage('Answers array required'),
  ],
  validate,
  submitAttempt
);

router.get('/my', protect, authorize('student'), getMyAttempts);

module.exports = router;
