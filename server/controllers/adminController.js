const User = require('../models/User');
const Class = require('../models/Class');

// @desc    Create a new teacher (admin only)
// @route   POST /api/admin/teachers
// @access  Private/Admin
const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
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
    const teachers = await User.find({ role: 'teacher' }).select('-password');
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

    // Verify teacher exists and is actually a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const newClass = await Class.create({
      name,
      section,
      teacherId,
      school,
    });

    // Assign classId to teacher if not already set
    if (!teacher.classId) {
      teacher.classId = newClass._id;
      await teacher.save();
    }

    // Auto-assign existing students with matching className and section to this class
    await User.updateMany(
      { 
        role: 'student', 
        className: name, 
        section: section || '' 
      },
      { $set: { classId: newClass._id } }
    );

    const populated = await Class.findById(newClass._id).populate(
      'teacherId',
      'name email'
    );

    res.status(201).json(populated);
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
    const classes = await Class.find().populate('teacherId', 'name email');
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

    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (teacherId) {
      const teacher = await User.findById(teacherId);
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

    // If name or section changed, update existing students and grab matching unassigned ones
    if (cls.name !== oldName || cls.section !== oldSection) {
      // 1. Update students already in this class
      await User.updateMany(
        { classId: cls._id, role: 'student' },
        { $set: { className: cls.name, section: cls.section } }
      );
      // 2. Auto-assign any other students matching the new name and section
      await User.updateMany(
        { 
          role: 'student', 
          className: cls.name, 
          section: cls.section || '' 
        },
        { $set: { classId: cls._id } }
      );
    }
    const populated = await Class.findById(cls._id).populate(
      'teacherId',
      'name email'
    );

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
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Unassign students from this class
    await User.updateMany(
      { classId: cls._id, role: 'student' },
      { $unset: { classId: '' } }
    );

    await cls.deleteOne();
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
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Unassign classes
    await Class.updateMany({ teacherId: teacher._id }, { $unset: { teacherId: '' } });
    await teacher.deleteOne();
    
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
