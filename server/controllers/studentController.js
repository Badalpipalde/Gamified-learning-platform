const User = require('../models/User');
const Class = require('../models/Class');
const ParentLink = require('../models/ParentLink');

// @desc    Add a student to teacher's class (create account)
// @route   POST /api/classes/:id/students
// @access  Private/Teacher
const addStudent = async (req, res) => {
  try {
    const classId = req.params.id;
    const { name, email, password, rollNo } = req.body;

    // Verify teacher owns the class
    const cls = await Class.findById(classId);
    if (!cls || cls.teacherId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to manage this class' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      classId,
      className: cls.name,
      section: cls.section,
      rollNo,
    });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      rollNo: student.rollNo,
      classId: student.classId,
      active: student.active,
    });
  } catch (err) {
    console.error('AddStudent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Soft-delete (deactivate) a student
// @route   PATCH /api/students/:id/deactivate
// @access  Private/Teacher
const deactivateStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verify teacher owns the class the student belongs to
    if (student.classId) {
      const cls = await Class.findById(student.classId);
      if (!cls || cls.teacherId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Not authorized to manage this student' });
      }
    }

    student.active = false;
    await student.save();

    // Revoke parent access automatically
    await ParentLink.updateMany(
      { studentId: student._id },
      { active: false }
    );

    res.json({ message: 'Student deactivated', _id: student._id });
  } catch (err) {
    console.error('DeactivateStudent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reactivate a student
// @route   PATCH /api/students/:id/activate
// @access  Private/Teacher
const activateStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verify teacher owns the class
    if (student.classId) {
      const cls = await Class.findById(student.classId);
      if (!cls || cls.teacherId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Not authorized to manage this student' });
      }
    }

    student.active = true;
    await student.save();

    // Restore parent access
    await ParentLink.updateMany(
      { studentId: student._id },
      { active: true }
    );

    res.json({ message: 'Student activated', _id: student._id });
  } catch (err) {
    console.error('ActivateStudent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove (delete) a student
// @route   DELETE /api/students/:id
// @access  Private/Teacher
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verify teacher owns the class the student belongs to
    if (student.classId) {
      const cls = await Class.findById(student.classId);
      if (!cls || cls.teacherId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Not authorized to manage this student' });
      }
    }

    await ParentLink.deleteMany({ studentId: student._id });
    await student.deleteOne();

    res.json({ message: 'Student removed successfully' });
  } catch (err) {
    console.error('DeleteStudent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change student password
// @route   PATCH /api/students/:id/password
// @access  Private/Teacher
const changeStudentPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verify teacher owns the class the student belongs to
    if (student.classId) {
      const cls = await Class.findById(student.classId);
      if (!cls || cls.teacherId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Not authorized to manage this student' });
      }
    }

    student.password = password;
    await student.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('ChangePassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addStudent, deactivateStudent, activateStudent, deleteStudent, changeStudentPassword };
