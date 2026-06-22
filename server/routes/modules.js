const express = require('express');
const router = express.Router();
const { getModules, getModuleByGrade, getModuleSubject } = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getModules);
router.get('/:grade', protect, getModuleByGrade);
router.get('/:grade/:subject', protect, getModuleSubject);

module.exports = router;
