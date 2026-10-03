const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateLanguage } = require('../controllers/authController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['student', 'parent'])
      .withMessage('Role must be student or parent'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

router.patch(
  '/language',
  protect,
  [body('language').isIn(['en', 'hi']).withMessage('Language must be en or hi')],
  validate,
  updateLanguage
);

module.exports = router;
