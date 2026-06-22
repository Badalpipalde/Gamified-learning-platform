const express = require('express');
const router = express.Router();
const { getAchievements, checkAchievements, createAchievement } = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getAchievements);
router.post('/check', protect, checkAchievements);
router.post('/', protect, roleCheck('teacher'), createAchievement);

module.exports = router;
