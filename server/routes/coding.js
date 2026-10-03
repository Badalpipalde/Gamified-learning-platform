const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const validate = require('../middleware/validate');
const { getProblems, getProblem, executeCode } = require('../controllers/codingController');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/problems', getProblems);
router.get('/problems/:id', getProblem);

router.post(
  '/execute/:id',
  [body('code').notEmpty().withMessage('Code is required')],
  validate,
  executeCode
);

module.exports = router;
