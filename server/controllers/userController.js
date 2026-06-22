const User = require('../models/User');

// @desc    Get all users (admin/teacher)
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ xp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges')
      .populate('completedLessons', 'title subject grade');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Link child to parent
// @route   POST /api/users/link-child
exports.linkChild = async (req, res, next) => {
  try {
    const { childEmail } = req.body;
    const parent = await User.findById(req.user._id);

    if (parent.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Only parents can link children' });
    }

    const child = await User.findOne({ email: childEmail, role: 'student' });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!parent.children.includes(child._id)) {
      parent.children.push(child._id);
      await parent.save();
    }

    res.json({ success: true, message: 'Child linked successfully', child: { name: child.name, email: child.email } });
  } catch (error) {
    next(error);
  }
};
