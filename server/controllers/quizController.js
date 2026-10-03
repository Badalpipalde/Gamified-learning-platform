const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ order: 1 });
    res.json(subjects);
  } catch (err) {
    console.error('GetSubjects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get quizzes by subject (optionally filter by level)
// @route   GET /api/quizzes?subject=slug&level=1
// @access  Private
const getQuizzes = async (req, res) => {
  try {
    const { subject, level } = req.query;
    const filter = {};

    if (subject) {
      const subj = await Subject.findOne({ slug: subject });
      if (!subj) return res.status(404).json({ message: 'Subject not found' });
      filter.subjectId = subj._id;
    }

    if (level) {
      filter.level = parseInt(level, 10);
    }

    const quizzes = await Quiz.find(filter)
      .populate('subjectId', 'name slug icon')
      .sort({ level: 1, createdAt: 1 });

    // If user is a student, attach their attempt info
    if (req.user.role === 'student') {
      const Attempt = require('../models/Attempt');
      const attempts = await Attempt.find({ userId: req.user._id })
        .select('quizId score totalQuestions')
        .lean();

      const attemptMap = {};
      attempts.forEach((a) => {
        const key = a.quizId.toString();
        if (!attemptMap[key] || a.score > attemptMap[key].score) {
          attemptMap[key] = a;
        }
      });

      const quizzesWithAttempts = quizzes.map((q) => {
        const qObj = q.toObject();
        const attempt = attemptMap[q._id.toString()];
        qObj.bestScore = attempt ? attempt.score : null;
        qObj.bestTotal = attempt ? attempt.totalQuestions : null;
        qObj.attempted = !!attempt;
        return qObj;
      });

      return res.json(quizzesWithAttempts);
    }

    res.json(quizzes);
  } catch (err) {
    console.error('GetQuizzes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single quiz with its questions (hide correctIndex for students)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('subjectId', 'name slug icon');

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quizId: quiz._id })
      .select(req.user.role === 'student' ? '-correctIndex -explanation' : '')
      .lean();

    res.json({ quiz, questions });
  } catch (err) {
    console.error('GetQuiz error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- Admin CRUD ----

// @desc    Create subject
// @route   POST /api/admin/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
  try {
    const { name, slug, icon, order } = req.body;
    const subject = await Subject.create({ name, slug, icon, order });
    res.status(201).json(subject);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Subject slug already exists' });
    }
    console.error('CreateSubject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create quiz with questions
// @route   POST /api/admin/quizzes
// @access  Private/Admin
const createQuiz = async (req, res) => {
  try {
    const { subjectId, title, level, questions } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(400).json({ message: 'Subject not found' });

    const quiz = await Quiz.create({
      subjectId,
      title,
      level,
      questionCount: questions ? questions.length : 0,
    });

    if (questions && questions.length > 0) {
      const questionDocs = questions.map((q) => ({
        quizId: quiz._id,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || { en: '', hi: '' },
      }));
      await Question.insertMany(questionDocs);
    }

    res.status(201).json(quiz);
  } catch (err) {
    console.error('CreateQuiz error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all subjects (admin)
// @route   GET /api/admin/subjects
// @access  Private/Admin
const getSubjectsAdmin = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ order: 1 });

    // Add quiz count per subject
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (s) => {
        const count = await Quiz.countDocuments({ subjectId: s._id });
        return { ...s.toObject(), quizCount: count };
      })
    );

    res.json(subjectsWithCounts);
  } catch (err) {
    console.error('GetSubjectsAdmin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all quizzes (admin)
// @route   GET /api/admin/quizzes
// @access  Private/Admin
const getQuizzesAdmin = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('subjectId', 'name slug icon')
      .sort({ subjectId: 1, level: 1 });
    res.json(quizzes);
  } catch (err) {
    console.error('GetQuizzesAdmin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSubjects,
  getQuizzes,
  getQuiz,
  createSubject,
  createQuiz,
  getSubjectsAdmin,
  getQuizzesAdmin,
};
