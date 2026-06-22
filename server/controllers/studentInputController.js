const StudentInput = require('../models/StudentInput');

// @desc    Get student's own inputs
// @route   GET /api/student-inputs/mine
exports.getMyInputs = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 15 } = req.query;
    const query = { student: req.user._id };
    if (type) query.type = type;

    const inputs = await StudentInput.find(query)
      .populate('lesson', 'title subject grade')
      .populate('teacherReply.teacher', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await StudentInput.countDocuments(query);

    res.json({
      success: true,
      count: inputs.length,
      total,
      pages: Math.ceil(total / limit),
      inputs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student input (note/feedback/suggestion)
// @route   POST /api/student-inputs
exports.createInput = async (req, res, next) => {
  try {
    req.body.student = req.user._id;
    const input = await StudentInput.create(req.body);
    await input.populate('lesson', 'title subject grade');

    res.status(201).json({ success: true, input });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student input
// @route   PUT /api/student-inputs/:id
exports.updateInput = async (req, res, next) => {
  try {
    let input = await StudentInput.findById(req.params.id);
    if (!input) {
      return res.status(404).json({ success: false, message: 'Input not found' });
    }
    if (input.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    input = await StudentInput.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('lesson', 'title subject grade');

    res.json({ success: true, input });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student input
// @route   DELETE /api/student-inputs/:id
exports.deleteInput = async (req, res, next) => {
  try {
    const input = await StudentInput.findById(req.params.id);
    if (!input) {
      return res.status(404).json({ success: false, message: 'Input not found' });
    }
    if (input.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await input.deleteOne();
    res.json({ success: true, message: 'Input deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inputs for teacher (feedback/suggestions on their lessons)
// @route   GET /api/student-inputs/teacher
exports.getInputsForTeacher = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 15 } = req.query;
    const Lesson = require('../models/Lesson');

    // Get teacher's lessons
    const teacherLessons = await Lesson.find({ teacher: req.user._id }).select('_id');
    const lessonIds = teacherLessons.map(l => l._id);

    const query = { lesson: { $in: lessonIds } };
    if (type) query.type = type;
    if (status) query.status = status;

    const inputs = await StudentInput.find(query)
      .populate('student', 'name avatar xp level')
      .populate('lesson', 'title subject grade')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await StudentInput.countDocuments(query);

    res.json({
      success: true,
      count: inputs.length,
      total,
      pages: Math.ceil(total / limit),
      inputs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher reply to student input
// @route   PUT /api/student-inputs/:id/reply
exports.replyToInput = async (req, res, next) => {
  try {
    const input = await StudentInput.findById(req.params.id);
    if (!input) {
      return res.status(404).json({ success: false, message: 'Input not found' });
    }

    input.teacherReply = {
      content: req.body.content,
      repliedAt: new Date(),
      teacher: req.user._id
    };
    input.status = 'reviewed';
    await input.save();
    await input.populate('teacherReply.teacher', 'name avatar');

    res.json({ success: true, input });
  } catch (error) {
    next(error);
  }
};
