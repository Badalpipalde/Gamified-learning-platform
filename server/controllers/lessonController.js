const Lesson = require('../models/Lesson');

// @desc    Get all lessons
// @route   GET /api/lessons
exports.getLessons = async (req, res, next) => {
  try {
    const { subject, grade, difficulty, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const lessons = await Lesson.find(query)
      .populate('teacher', 'name avatar')
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Lesson.countDocuments(query);

    res.json({
      success: true,
      count: lessons.length,
      total,
      pages: Math.ceil(total / limit),
      lessons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('teacher', 'name avatar')
      .populate('quizzes');

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lesson (teacher only)
// @route   POST /api/lessons
exports.createLesson = async (req, res, next) => {
  try {
    req.body.teacher = req.user._id;
    const lesson = await Lesson.create(req.body);

    // Add to teacher's created lessons
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdLessons: lesson._id }
    });

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
exports.updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (lesson.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this lesson' });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (lesson.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lesson' });
    }

    await lesson.deleteOne();
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher's lessons
// @route   GET /api/lessons/my-lessons
exports.getMyLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ teacher: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: lessons.length, lessons });
  } catch (error) {
    next(error);
  }
};
