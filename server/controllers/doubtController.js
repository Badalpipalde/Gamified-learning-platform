const Doubt = require('../models/Doubt');
const Class = require('../models/Class');
const ParentLink = require('../models/ParentLink');
const User = require('../models/User');

// @desc    Create a new doubt
// @route   POST /api/doubts
// @access  Private/Student
const createDoubt = async (req, res) => {
  try {
    const { subjectId, title, description } = req.body;
    const studentId = req.user._id;

    const student = await User.findById(studentId);
    if (!student.classId) {
      return res.status(400).json({ message: 'You must be assigned to a class to ask doubts' });
    }

    const doubt = await Doubt.create({
      studentId,
      classId: student.classId,
      subjectId: subjectId || undefined,
      title,
      description,
    });

    res.status(201).json(doubt);
  } catch (err) {
    console.error('CreateDoubt error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doubts for a student
// @route   GET /api/doubts/student
// @access  Private/Student
const getStudentDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ studentId: req.user._id })
      .populate('subjectId', 'name icon')
      .populate('replies.userId', 'name role')
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (err) {
    console.error('GetStudentDoubts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doubts for a teacher's classes
// @route   GET /api/doubts/teacher
// @access  Private/Teacher
const getTeacherDoubts = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id });
    const classIds = classes.map((c) => c._id);

    const doubts = await Doubt.find({ classId: { $in: classIds } })
      .populate('studentId', 'name rollNo')
      .populate('subjectId', 'name icon')
      .populate('replies.userId', 'name role')
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (err) {
    console.error('GetTeacherDoubts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doubts for a parent's linked children (read-only)
// @route   GET /api/doubts/parent
// @access  Private/Parent
const getParentDoubts = async (req, res) => {
  try {
    const links = await ParentLink.find({ parentId: req.user._id, active: true });
    const studentIds = links.map((l) => l.studentId);

    const doubts = await Doubt.find({ studentId: { $in: studentIds } })
      .populate('studentId', 'name')
      .populate('subjectId', 'name icon')
      .populate('replies.userId', 'name role')
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (err) {
    console.error('GetParentDoubts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a reply to a doubt (Student or Teacher)
// @route   POST /api/doubts/:id/replies
// @access  Private/Student,Teacher
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Verify access
    if (req.user.role === 'student' && doubt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'teacher') {
      const isTeacherOfClass = await Class.exists({ _id: doubt.classId, teacherId: req.user._id });
      if (!isTeacherOfClass) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    doubt.replies.push({
      userId: req.user._id,
      text,
    });

    // If teacher replies, mark as answered. If student replies again, keep it open/answered as is or maybe reopen. 
    // Let's keep it simple: if teacher, status = answered.
    if (req.user.role === 'teacher') {
      doubt.status = 'answered';
    }

    await doubt.save();
    
    const updatedDoubt = await Doubt.findById(req.params.id)
      .populate('studentId', 'name rollNo')
      .populate('subjectId', 'name icon')
      .populate('replies.userId', 'name role');

    res.status(201).json(updatedDoubt);
  } catch (err) {
    console.error('AddReply error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change doubt status (Teacher only)
// @route   PATCH /api/doubts/:id/status
// @access  Private/Teacher
const changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    const isTeacherOfClass = await Class.exists({ _id: doubt.classId, teacherId: req.user._id });
    if (!isTeacherOfClass) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    doubt.status = status;
    await doubt.save();

    res.json(doubt);
  } catch (err) {
    console.error('ChangeStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDoubt,
  getStudentDoubts,
  getTeacherDoubts,
  getParentDoubts,
  addReply,
  changeStatus,
};
