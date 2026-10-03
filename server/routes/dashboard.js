const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  getStudentDashboard,
  getParentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/parent', protect, authorize('parent'), getParentDashboard);
router.get('/teacher', protect, authorize('teacher'), getTeacherDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
