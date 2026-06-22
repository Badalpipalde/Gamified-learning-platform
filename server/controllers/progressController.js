const Progress = require('../models/Progress');
const User = require('../models/User');
const Lesson = require('../models/Lesson');

// @desc    Get student progress
// @route   GET /api/progress
exports.getMyProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ student: req.user._id })
      .populate('lesson', 'title subject grade thumbnailUrl xpReward')
      .sort({ lastAccessedAt: -1 });

    const stats = {
      totalLessons: progress.length,
      completed: progress.filter(p => p.status === 'completed').length,
      inProgress: progress.filter(p => p.status === 'in_progress').length,
      totalXP: progress.reduce((sum, p) => sum + p.xpEarned, 0),
      totalCoins: progress.reduce((sum, p) => sum + p.coinsEarned, 0),
      totalTime: progress.reduce((sum, p) => sum + p.timeSpent, 0)
    };

    res.json({ success: true, stats, progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or create progress for a lesson
// @route   POST /api/progress/:lessonId
exports.updateProgress = async (req, res, next) => {
  try {
    const { videoWatched, quizCompleted, quizScore, exerciseCompleted, timeSpent } = req.body;

    let progress = await Progress.findOne({
      student: req.user._id,
      lesson: req.params.lessonId
    });

    if (!progress) {
      progress = new Progress({
        student: req.user._id,
        lesson: req.params.lessonId
      });
    }

    if (videoWatched !== undefined) progress.videoWatched = videoWatched;
    if (quizCompleted !== undefined) progress.quizCompleted = quizCompleted;
    if (quizScore !== undefined) progress.quizScore = quizScore;
    if (exerciseCompleted !== undefined) progress.exerciseCompleted = exerciseCompleted;
    if (timeSpent) progress.timeSpent += timeSpent;

    // Calculate progress percentage
    let percent = 0;
    if (progress.videoWatched) percent += 40;
    if (progress.quizCompleted) percent += 40;
    if (progress.exerciseCompleted) percent += 20;
    progress.progressPercent = percent;

    // Check completion
    if (percent === 100 && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();

      const lesson = await Lesson.findById(req.params.lessonId);
      progress.xpEarned = lesson.xpReward;
      progress.coinsEarned = lesson.coinReward;

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { xp: lesson.xpReward, coins: lesson.coinReward },
        $addToSet: { completedLessons: lesson._id }
      });

      // Update lesson completedBy
      await Lesson.findByIdAndUpdate(req.params.lessonId, {
        $addToSet: { completedBy: req.user._id }
      });
    } else if (percent > 0) {
      progress.status = 'in_progress';
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress for a specific student (teacher/parent)
// @route   GET /api/progress/student/:studentId
exports.getStudentProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ student: req.params.studentId })
      .populate('lesson', 'title subject grade thumbnailUrl')
      .sort({ lastAccessedAt: -1 });

    const stats = {
      totalLessons: progress.length,
      completed: progress.filter(p => p.status === 'completed').length,
      inProgress: progress.filter(p => p.status === 'in_progress').length,
      totalXP: progress.reduce((sum, p) => sum + p.xpEarned, 0),
      totalTime: progress.reduce((sum, p) => sum + p.timeSpent, 0)
    };

    res.json({ success: true, stats, progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly summary for parent
// @route   GET /api/progress/weekly/:studentId
exports.getWeeklySummary = async (req, res, next) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const progress = await Progress.find({
      student: req.params.studentId,
      lastAccessedAt: { $gte: oneWeekAgo }
    }).populate('lesson', 'title subject grade');

    const summary = {
      lessonsCompleted: progress.filter(p => p.status === 'completed' && p.completedAt >= oneWeekAgo).length,
      lessonsInProgress: progress.filter(p => p.status === 'in_progress').length,
      xpEarned: progress.reduce((sum, p) => sum + p.xpEarned, 0),
      timeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      averageQuizScore: progress.filter(p => p.quizCompleted).length > 0
        ? Math.round(progress.filter(p => p.quizCompleted).reduce((sum, p) => sum + p.quizScore, 0) / progress.filter(p => p.quizCompleted).length)
        : 0,
      subjects: [...new Set(progress.map(p => p.lesson?.subject).filter(Boolean))]
    };

    res.json({ success: true, summary, progress });
  } catch (error) {
    next(error);
  }
};
