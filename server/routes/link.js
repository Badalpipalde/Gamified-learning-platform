const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  generateLinkCode,
  redeemLinkCode,
  getLinkedChildren,
  unlinkChild,
} = require('../controllers/linkController');

const router = express.Router();

// Student generates code
router.post('/generate', protect, authorize('student'), generateLinkCode);

// Parent redeems code
router.post(
  '/redeem',
  protect,
  authorize('parent'),
  [
    body('code')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('Code must be exactly 6 characters'),
  ],
  validate,
  redeemLinkCode
);

// Parent gets linked children
router.get('/children', protect, authorize('parent'), getLinkedChildren);

// Parent unlinks child
router.delete('/children/:studentId', protect, authorize('parent'), unlinkChild);

module.exports = router;
