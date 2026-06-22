const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, addReply, toggleLike, deletePost } = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPosts);
router.get('/:id', protect, getPost);
router.post('/', protect, createPost);
router.post('/:id/reply', protect, addReply);
router.put('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);

module.exports = router;
