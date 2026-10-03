const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  createDoubt,
  getStudentDoubts,
  getTeacherDoubts,
  getParentDoubts,
  addReply,
  changeStatus,
} = require('../controllers/doubtController');

const router = express.Router();

router.use(protect);

// Student creates doubt
router.post(
  '/',
  authorize('student'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  validate,
  createDoubt
);

// Get doubts by role
router.get('/student', authorize('student'), getStudentDoubts);
router.get('/teacher', authorize('teacher'), getTeacherDoubts);
router.get('/parent', authorize('parent'), getParentDoubts);

// Add reply
router.post(
  '/:id/replies',
  authorize('student', 'teacher'),
  [body('text').trim().notEmpty().withMessage('Reply text cannot be empty')],
  validate,
  addReply
);

// Change status
router.patch(
  '/:id/status',
  authorize('teacher'),
  [body('status').isIn(['open', 'answered', 'closed']).withMessage('Invalid status')],
  validate,
  changeStatus
);

module.exports = router;
