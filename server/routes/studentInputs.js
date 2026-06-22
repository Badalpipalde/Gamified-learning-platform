const express = require('express');
const router = express.Router();
const { getMyInputs, createInput, updateInput, deleteInput, getInputsForTeacher, replyToInput } = require('../controllers/studentInputController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Student routes
router.get('/mine', protect, roleCheck('student'), getMyInputs);
router.post('/', protect, roleCheck('student'), createInput);
router.put('/:id', protect, roleCheck('student'), updateInput);
router.delete('/:id', protect, roleCheck('student'), deleteInput);

// Teacher routes
router.get('/teacher', protect, roleCheck('teacher'), getInputsForTeacher);
router.put('/:id/reply', protect, roleCheck('teacher'), replyToInput);

module.exports = router;
