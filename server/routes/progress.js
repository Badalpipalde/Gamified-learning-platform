const express = require('express');
const router = express.Router();
const { getMyProgress, updateProgress, getStudentProgress, getWeeklySummary } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getMyProgress);
router.post('/:lessonId', protect, roleCheck('student'), updateProgress);
router.get('/student/:studentId', protect, roleCheck('teacher', 'parent'), getStudentProgress);
router.get('/weekly/:studentId', protect, roleCheck('parent', 'teacher'), getWeeklySummary);

module.exports = router;
