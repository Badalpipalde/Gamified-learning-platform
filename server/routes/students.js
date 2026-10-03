const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  addStudent,
  deactivateStudent,
  activateStudent,
} = require('../controllers/studentController');

const router = express.Router();

// Teacher: add student to class
router.post(
  '/class/:id/students',
  protect,
  authorize('teacher'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  addStudent
);

// Teacher: soft-delete student
router.patch(
  '/:id/deactivate',
  protect,
  authorize('teacher'),
  deactivateStudent
);

// Teacher: reactivate student
router.patch(
  '/:id/activate',
  protect,
  authorize('teacher'),
  activateStudent
);

module.exports = router;
