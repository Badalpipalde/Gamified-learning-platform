const User = require('../models/User');
const Class = require('../models/Class');
const protect = require('../middleware/auth');

// @desc    Create a new teacher (admin only)
// @route   POST /api/admin/teachers
// @access  Private/Admin
const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email }).select('_id').lean();
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const teacher = await User.create({
      name,
      email,
      password,
      role: 'teacher',
    });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
    });
  } catch (err) {
    console.error('CreateTeacher error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @access  Private/Admin
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').lean();
    res.json(teachers);
  } catch (err) {
    console.error('GetTeachers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new class
// @route   POST /api/admin/classes
// @access  Private/Admin
const createClass = async (req, res) => {
  try {
    const { name, section, teacherId, school } = req.body;

    const teacher = await User.findById(teacherId).select('role classId name email').lean();
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const newClass = await Class.create({
      name,
      section,
      teacherId,
      school,
    });

    await Promise.all([
      !teacher.classId
        ? User.findByIdAndUpdate(teacher._id, { classId: newClass._id })
        : Promise.resolve(null),
      User.updateMany(
        {
          role: 'student',
          className: name,
          section: section || '',
        },
        { $set: { classId: newClass._id } }
      ),
    ]);

    if (!teacher.classId) {
      protect.invalidateUserCache(teacher._id);
    }

    const classObj = newClass.toObject();
    classObj.teacherId = {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    };

    res.status(201).json(classObj);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Class with same name, section, and teacher already exists' });
    }
    console.error('CreateClass error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all classes
// @route   GET /api/admin/classes
// @access  Private/Admin
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherId', 'name email').lean();
    res.json(classes);
  } catch (err) {
    console.error('GetClasses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a class
// @route   PUT /api/admin/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
  try {
    const { name, section, teacherId, school } = req.body;

    const [cls, teacher] = await Promise.all([
      Class.findById(req.params.id),
      teacherId ? User.findById(teacherId).select('role').lean() : Promise.resolve(null),
    ]);

    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (teacherId) {
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher ID' });
      }
      cls.teacherId = teacherId;
    }

    const oldName = cls.name;
    const oldSection = cls.section;

    if (name) cls.name = name;
    if (section !== undefined) cls.section = section;
    if (school !== undefined) cls.school = school;

    await cls.save();

    if (cls.name !== oldName || cls.section !== oldSection) {
      await Promise.all([
        User.updateMany(
          { classId: cls._id, role: 'student' },
          { $set: { className: cls.name, section: cls.section } }
        ),
        User.updateMany(
          {
            role: 'student',
            className: cls.name,
            section: cls.section || '',
          },
          { $set: { classId: cls._id } }
        ),
      ]);
    }

    const populated = await Class.findById(cls._id)
      .populate('teacherId', 'name email')
      .lean();

    res.json(populated);
  } catch (err) {
    console.error('UpdateClass error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a class
// @route   DELETE /api/admin/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).select('_id').lean();
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await Promise.all([
      User.updateMany(
        { classId: cls._id, role: 'student' },
        { $unset: { classId: '' } }
      ),
      Class.deleteOne({ _id: cls._id }),
    ]);

    res.json({ message: 'Class deleted' });
  } catch (err) {
    console.error('DeleteClass error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a teacher
// @route   DELETE /api/admin/teachers/:id
// @access  Private/Admin
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' }).select('_id').lean();
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await Promise.all([
      Class.updateMany({ teacherId: teacher._id }, { $unset: { teacherId: '' } }),
      User.deleteOne({ _id: teacher._id }),
    ]);

    protect.invalidateUserCache(teacher._id);

    res.json({ message: 'Teacher removed successfully' });
  } catch (err) {
    console.error('DeleteTeacher error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  deleteTeacher,
  createClass,
  getClasses,
  updateClass,
  deleteClass,
};
