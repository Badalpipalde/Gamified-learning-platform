const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const { getMyPoints, getLeaderboard, getBadges } = require('../controllers/pointsController');

const router = express.Router();

router.get('/me', protect, authorize('student'), getMyPoints);
router.get('/leaderboard/:classId', protect, getLeaderboard);
router.get('/badges', protect, getBadges);

module.exports = router;
