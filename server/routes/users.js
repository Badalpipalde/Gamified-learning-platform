const express = require('express');
const router = express.Router();
const { getUsers, getUserById, linkChild } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('teacher', 'parent'), getUsers);
router.get('/:id', protect, getUserById);
router.post('/link-child', protect, roleCheck('parent'), linkChild);

module.exports = router;
