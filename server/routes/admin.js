const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  createTeacher,
  getTeachers,
  deleteTeacher,
  createClass,
  getClasses,
  updateClass,
  deleteClass,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// Teacher management
router.post(
  '/teachers',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  createTeacher
);

router.get('/teachers', getTeachers);
router.delete('/teachers/:id', deleteTeacher);

// Class management
router.post(
  '/classes',
  [
    body('name').trim().notEmpty().withMessage('Class name is required'),
    body('teacherId').isMongoId().withMessage('Valid teacher ID is required'),
  ],
  validate,
  createClass
);

router.get('/classes', getClasses);

router.put(
  '/classes/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Class name cannot be empty'),
    body('teacherId').optional().isMongoId().withMessage('Valid teacher ID is required'),
  ],
  validate,
  updateClass
);

router.delete('/classes/:id', deleteClass);

// Subject management
const {
  createSubject,
  createQuiz,
  getSubjectsAdmin,
  getQuizzesAdmin,
} = require('../controllers/quizController');

router.get('/subjects', getSubjectsAdmin);

router.post(
  '/subjects',
  [
    body('name.en').trim().notEmpty().withMessage('English name is required'),
    body('name.hi').trim().notEmpty().withMessage('Hindi name is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
  ],
  validate,
  createSubject
);

// Quiz management
router.get('/quizzes', getQuizzesAdmin);

router.post(
  '/quizzes',
  [
    body('subjectId').isMongoId().withMessage('Valid subject ID required'),
    body('title.en').trim().notEmpty().withMessage('English title is required'),
    body('title.hi').trim().notEmpty().withMessage('Hindi title is required'),
    body('level').isInt({ min: 1, max: 5 }).withMessage('Level must be 1-5'),
  ],
  validate,
  createQuiz
);

module.exports = router;
