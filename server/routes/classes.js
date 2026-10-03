const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const { getStudentsByClass, getMyClasses } = require('../controllers/classController');

const router = express.Router();

// Teacher: get their own classes
router.get('/my', protect, authorize('teacher'), getMyClasses);

// Teacher/Admin: get students in a class
router.get('/:id/students', protect, authorize('teacher', 'admin'), getStudentsByClass);

module.exports = router;
