const ForumPost = require('../models/ForumPost');

// @desc    Get forum posts
// @route   GET /api/forum
exports.getPosts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 15 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar role xp level')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ForumPost.countDocuments(query);
    res.json({ success: true, count: posts.length, total, pages: Math.ceil(total / limit), posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/forum/:id
exports.getPost = async (req, res, next) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar role xp level')
      .populate('replies.author', 'name avatar role');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Create post
// @route   POST /api/forum
exports.createPost = async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    const post = await ForumPost.create(req.body);
    await post.populate('author', 'name avatar role');
    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply
// @route   POST /api/forum/:id/reply
exports.addReply = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.replies.push({
      author: req.user._id,
      content: req.body.content
    });
    await post.save();
    await post.populate('replies.author', 'name avatar role');

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike post
// @route   PUT /api/forum/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user._id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: index === -1 });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/forum/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};
