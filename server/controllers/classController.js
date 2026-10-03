const User = require('../models/User');
const Class = require('../models/Class');

// @desc    Get students in a class
// @route   GET /api/classes/:id/students
// @access  Private/Teacher,Admin
const getStudentsByClass = async (req, res) => {
  try {
    const classId = req.params.id;

    // If teacher, ensure they own the class
    if (req.user.role === 'teacher') {
      const cls = await Class.findById(classId);
      if (!cls || cls.teacherId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Not authorized to view this class' });
      }
    }

    const students = await User.find({
      classId,
      role: 'student',
    })
      .select('-password')
      .sort({ name: 1 });

    res.json(students);
  } catch (err) {
    console.error('GetStudentsByClass error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get classes for current teacher
// @route   GET /api/classes/my
// @access  Private/Teacher
const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id });
    res.json(classes);
  } catch (err) {
    console.error('GetMyClasses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStudentsByClass, getMyClasses };
