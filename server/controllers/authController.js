const User = require('../models/User');
const Class = require('../models/Class');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (student or parent self-register)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, surname, email, password, role, rollNo, className, section } = req.body;

    // Only students and parents can self-register
    if (role && !['student', 'parent'].includes(role)) {
      return res.status(400).json({
        message: 'Only students and parents can self-register',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const fullName = surname ? `${name} ${surname}` : name;

    let classId;
    if (role === 'student' && className) {
      const existingClass = await Class.findOne({ 
        name: className, 
        section: section || '' 
      });
      if (existingClass) {
        classId = existingClass._id;
      }
    }

    const user = await User.create({
      name: fullName,
      email,
      password,
      role: role || 'student',
      rollNo,
      className,
      section,
      classId
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      classId: user.classId,
      className: user.className,
      section: user.section,
      rollNo: user.rollNo,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('classId', 'name section school')
      .populate('badges');

    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user language preference
// @route   PATCH /api/auth/language
// @access  Private
const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!['en', 'hi'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    req.user.language = language;
    await req.user.save();

    res.json({ language: req.user.language });
  } catch (err) {
    console.error('UpdateLanguage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateLanguage };
