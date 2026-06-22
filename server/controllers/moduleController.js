const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Progress = require('../models/Progress');

// Subject config per grade range
const PRIMARY_SUBJECTS = ['mathematics', 'science', 'english', 'hindi', 'environmental_studies'];
const SECONDARY_SUBJECTS = ['mathematics', 'science', 'english', 'hindi', 'social_studies', 'computer_science', 'environmental_studies'];

const getSubjectsForGrade = (grade) => grade <= 5 ? PRIMARY_SUBJECTS : SECONDARY_SUBJECTS;

// @desc    Get all class modules (1-12) with stats
// @route   GET /api/modules
exports.getModules = async (req, res, next) => {
  try {
    const modules = [];

    for (let grade = 1; grade <= 12; grade++) {
      const subjects = getSubjectsForGrade(grade);
      const lessonCount = await Lesson.countDocuments({ grade, isPublished: true });
      const quizCount = await Quiz.countDocuments({
        lesson: { $in: await Lesson.find({ grade }).select('_id') },
        isPublished: true
      });

      // Check if Module metadata exists, otherwise use defaults
      let moduleMeta = await Module.findOne({ grade });

      modules.push({
        grade,
        title: moduleMeta?.title || `Class ${grade}`,
        titleHi: moduleMeta?.titleHi || `कक्षा ${grade}`,
        description: moduleMeta?.description || `All subjects and lessons for Class ${grade}`,
        descriptionHi: moduleMeta?.descriptionHi || `कक्षा ${grade} के सभी विषय और पाठ`,
        thumbnail: moduleMeta?.thumbnail || '',
        subjects,
        subjectCount: subjects.length,
        lessonCount,
        quizCount,
        isActive: moduleMeta?.isActive !== false
      });
    }

    res.json({ success: true, modules });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subjects for a specific grade with lesson counts
// @route   GET /api/modules/:grade
exports.getModuleByGrade = async (req, res, next) => {
  try {
    const grade = parseInt(req.params.grade);
    if (grade < 1 || grade > 12) {
      return res.status(400).json({ success: false, message: 'Grade must be between 1 and 12' });
    }

    const subjects = getSubjectsForGrade(grade);
    const subjectDetails = [];

    for (const subject of subjects) {
      const lessonCount = await Lesson.countDocuments({ grade, subject, isPublished: true });
      const lessons = await Lesson.find({ grade, subject, isPublished: true }).select('_id');
      const quizCount = await Quiz.countDocuments({ lesson: { $in: lessons }, isPublished: true });

      // Get progress for current user if student
      let progress = 0;
      if (req.user.role === 'student') {
        const completedLessons = await Progress.countDocuments({
          student: req.user._id,
          lesson: { $in: lessons },
          status: 'completed'
        });
        progress = lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0;
      }

      subjectDetails.push({
        subject,
        lessonCount,
        quizCount,
        progress
      });
    }

    const moduleMeta = await Module.findOne({ grade });

    res.json({
      success: true,
      grade,
      title: moduleMeta?.title || `Class ${grade}`,
      titleHi: moduleMeta?.titleHi || `कक्षा ${grade}`,
      description: moduleMeta?.description || `All subjects and lessons for Class ${grade}`,
      subjects: subjectDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lessons for a grade + subject
// @route   GET /api/modules/:grade/:subject
exports.getModuleSubject = async (req, res, next) => {
  try {
    const grade = parseInt(req.params.grade);
    const { subject } = req.params;

    if (grade < 1 || grade > 12) {
      return res.status(400).json({ success: false, message: 'Grade must be between 1 and 12' });
    }

    const lessons = await Lesson.find({ grade, subject, isPublished: true })
      .populate('teacher', 'name avatar')
      .populate('quizzes')
      .sort({ order: 1, createdAt: -1 });

    // Get quizzes for these lessons
    const lessonIds = lessons.map(l => l._id);
    const quizzes = await Quiz.find({ lesson: { $in: lessonIds }, isPublished: true })
      .populate('teacher', 'name')
      .select('-questions.options.isCorrect -questions.correctAnswer');

    // Get progress for student
    let progressMap = {};
    if (req.user.role === 'student') {
      const progressRecords = await Progress.find({
        student: req.user._id,
        lesson: { $in: lessonIds }
      });
      progressRecords.forEach(p => {
        progressMap[p.lesson.toString()] = p;
      });
    }

    res.json({
      success: true,
      grade,
      subject,
      lessons: lessons.map(l => ({
        ...l.toObject(),
        progress: progressMap[l._id.toString()] || null
      })),
      quizzes
    });
  } catch (error) {
    next(error);
  }
};
