const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Lesson = require('../models/Lesson');

// @desc    Get quizzes
// @route   GET /api/quizzes
exports.getQuizzes = async (req, res, next) => {
  try {
    const { lesson, difficulty, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };
    if (lesson) query.lesson = lesson;
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query)
      .populate('lesson', 'title subject')
      .populate('teacher', 'name')
      .select('-questions.options.isCorrect -questions.correctAnswer')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments(query);
    res.json({ success: true, count: quizzes.length, total, quizzes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz (with answers hidden)
// @route   GET /api/quizzes/:id
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('lesson', 'title subject');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Hide correct answers for students
    const sanitized = quiz.toObject();
    if (req.user.role === 'student') {
      sanitized.questions.forEach(q => {
        q.options.forEach(o => delete o.isCorrect);
        delete q.correctAnswer;
        delete q.explanation;
      });
    }

    res.json({ success: true, quiz: sanitized });
  } catch (error) {
    next(error);
  }
};

// @desc    Create quiz (teacher only)
// @route   POST /api/quizzes
exports.createQuiz = async (req, res, next) => {
  try {
    req.body.teacher = req.user._id;
    const quiz = await Quiz.create(req.body);

    // Link quiz to lesson
    if (req.body.lesson) {
      await Lesson.findByIdAndUpdate(req.body.lesson, {
        $push: { quizzes: quiz._id }
      });
    }

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { answers } = req.body; // [{questionIndex, selectedOption}]
    let score = 0;
    let totalPoints = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      const userAnswer = answers.find(a => a.questionIndex === index);
      let isCorrect = false;

      if (userAnswer) {
        if (question.type === 'mcq' || question.type === 'true_false') {
          isCorrect = question.options[userAnswer.selectedOption]?.isCorrect || false;
        } else if (question.type === 'fill_blank') {
          isCorrect = userAnswer.answer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        }
      }

      if (isCorrect) score += question.points;
      results.push({ questionIndex: index, selectedOption: userAnswer?.selectedOption, isCorrect });
    });

    // Save attempt
    quiz.attempts.push({
      student: req.user._id,
      score,
      totalPoints,
      answers: results
    });
    await quiz.save();

    // Award XP and coins
    const percentage = (score / totalPoints) * 100;
    let xpEarned = Math.floor(quiz.xpReward * (percentage / 100));
    let coinsEarned = percentage >= quiz.passingScore ? quiz.coinReward : 0;

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { xp: xpEarned, coins: coinsEarned }
    });

    res.json({
      success: true,
      score,
      totalPoints,
      percentage: Math.round(percentage),
      passed: percentage >= quiz.passingScore,
      xpEarned,
      coinsEarned,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, quiz: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await quiz.deleteOne();
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    next(error);
  }
};
