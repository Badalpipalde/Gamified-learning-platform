const User = require('../models/User');
const Class = require('../models/Class');

// @desc    Get students in a class
// @route   GET /api/classes/:id/students
// @access  Private/Teacher,Admin
const getStudentsByClass = async (req, res) => {
  try {
    const classId = req.params.id;

    if (req.user.role === 'teacher') {
      const [cls, students] = await Promise.all([
        Class.findById(classId).select('teacherId').lean(),
        User.find({ classId, role: 'student' })
          .select('-password')
          .sort({ name: 1 })
          .lean(),
      ]);

      if (!cls || cls.teacherId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Not authorized to view this class' });
      }

      return res.json(students);
    }

    const students = await User.find({
      classId,
      role: 'student',
    })
      .select('-password')
      .sort({ name: 1 })
      .lean();

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
    const classes = await Class.find({ teacherId: req.user._id }).lean();
    res.json(classes);
  } catch (err) {
    console.error('GetMyClasses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStudentsByClass, getMyClasses };
