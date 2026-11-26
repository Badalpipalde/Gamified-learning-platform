const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');

const SUBJECTS_CACHE_TTL_MS = 60_000;
let subjectsCache = { data: null, expiresAt: 0 };

async function fetchSubjectsCached() {
  if (subjectsCache.data && subjectsCache.expiresAt > Date.now()) {
    return subjectsCache.data;
  }
  const subjects = await Subject.find().sort({ order: 1 }).lean();
  subjectsCache = {
    data: subjects,
    expiresAt: Date.now() + SUBJECTS_CACHE_TTL_MS,
  };
  return subjects;
}

// @desc    Get all subjects
// @route   GET /api/quizzes/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await fetchSubjectsCached();
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
    let resolvedSubject = null;

    if (subject) {
      const subjects = await fetchSubjectsCached();
      resolvedSubject = subjects.find((s) => s.slug === subject.toLowerCase());
      if (!resolvedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      filter.subjectId = resolvedSubject._id;
    }

    if (level) {
      filter.level = parseInt(level, 10);
    }

    const quizQuery = resolvedSubject
      ? Quiz.find(filter).sort({ level: 1, createdAt: 1 }).lean()
      : Quiz.find(filter)
          .populate('subjectId', 'name slug icon')
          .sort({ level: 1, createdAt: 1 })
          .lean();

    if (req.user.role === 'student') {
      const [quizzes, attempts] = await Promise.all([
        quizQuery,
        Attempt.find({ userId: req.user._id })
          .select('quizId score totalQuestions')
          .lean(),
      ]);

      const attemptMap = {};
      for (const a of attempts) {
        const key = a.quizId.toString();
        if (!attemptMap[key] || a.score > attemptMap[key].score) {
          attemptMap[key] = a;
        }
      }

      const subjectSummary = resolvedSubject
        ? {
            _id: resolvedSubject._id,
            name: resolvedSubject.name,
            slug: resolvedSubject.slug,
            icon: resolvedSubject.icon,
          }
        : null;

      const quizzesWithAttempts = quizzes.map((q) => {
        const attempt = attemptMap[q._id.toString()];
        return {
          ...q,
          ...(subjectSummary ? { subjectId: subjectSummary } : {}),
          bestScore: attempt ? attempt.score : null,
          bestTotal: attempt ? attempt.totalQuestions : null,
          attempted: !!attempt,
        };
      });

      return res.json(quizzesWithAttempts);
    }

    const quizzes = await quizQuery;
    if (resolvedSubject) {
      const subjectSummary = {
        _id: resolvedSubject._id,
        name: resolvedSubject.name,
        slug: resolvedSubject.slug,
        icon: resolvedSubject.icon,
      };
      return res.json(quizzes.map((q) => ({ ...q, subjectId: subjectSummary })));
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
    const questionSelect = req.user.role === 'student' ? '-correctIndex -explanation' : '';

    const [quiz, questions] = await Promise.all([
      Quiz.findById(req.params.id).populate('subjectId', 'name slug icon').lean(),
      Question.find({ quizId: req.params.id }).select(questionSelect).lean(),
    ]);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

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
    subjectsCache = { data: null, expiresAt: 0 };
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

    const subject = await Subject.findById(subjectId).lean();
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
    const [subjects, counts] = await Promise.all([
      Subject.find().sort({ order: 1 }).lean(),
      Quiz.aggregate([{ $group: { _id: '$subjectId', count: { $sum: 1 } } }]),
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));
    const subjectsWithCounts = subjects.map((s) => ({
      ...s,
      quizCount: countMap.get(s._id.toString()) || 0,
    }));

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
      .sort({ subjectId: 1, level: 1 })
      .lean();
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
