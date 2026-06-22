const express = require('express');
const router = express.Router();
const { getLessons, getLesson, createLesson, updateLesson, deleteLesson, getMyLessons } = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getLessons);
router.get('/my-lessons', protect, roleCheck('teacher'), getMyLessons);
router.get('/:id', protect, getLesson);
router.post('/', protect, roleCheck('teacher'), createLesson);
router.put('/:id', protect, roleCheck('teacher'), updateLesson);
router.delete('/:id', protect, roleCheck('teacher'), deleteLesson);

module.exports = router;
