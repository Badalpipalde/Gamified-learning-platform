const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const PointsLedger = require('../models/PointsLedger');
const Badge = require('../models/Badge');
const User = require('../models/User');

const POINTS_PER_CORRECT = 10;
const STREAK_BONUS = 5; // bonus per streak day milestone

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000,
];

function calcLevel(totalPoints) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

// @desc    Submit quiz attempt — server-side scoring
// @route   POST /api/attempts
// @access  Private/Student
const submitAttempt = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    // Get quiz and its questions
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quizId }).sort({ _id: 1 });
    if (questions.length === 0) {
      return res.status(400).json({ message: 'Quiz has no questions' });
    }

    if (!answers || answers.length !== questions.length) {
      return res.status(400).json({
        message: `Expected ${questions.length} answers, got ${answers ? answers.length : 0}`,
      });
    }

    // Score on server
    let score = 0;
    const results = questions.map((q, i) => {
      const correct = q.correctIndex === answers[i];
      if (correct) score++;
      return {
        questionId: q._id,
        selected: answers[i],
        correct,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      };
    });

    const pointsEarned = score * POINTS_PER_CORRECT;

    // Save attempt
    const attempt = await Attempt.create({
      userId,
      quizId,
      answers,
      score,
      totalQuestions: questions.length,
      pointsEarned,
      timeTaken: timeTaken || 0,
    });

    // Add to points ledger
    if (pointsEarned > 0) {
      await PointsLedger.create({
        userId,
        source: 'quiz',
        sourceId: attempt._id,
        points: pointsEarned,
        description: `Quiz: ${quiz.title.en}`,
      });
    }

    // Update user streak
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakBonus = 0;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        user.streak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        user.streak = 1;
      }
      // diffDays === 0: same day, don't change streak
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = new Date();

    // Streak milestones: 3, 7, 14, 30
    const streakMilestones = [3, 7, 14, 30];
    if (streakMilestones.includes(user.streak)) {
      streakBonus = user.streak * STREAK_BONUS;
      await PointsLedger.create({
        userId,
        source: 'streak',
        points: streakBonus,
        description: `${user.streak}-day streak bonus`,
      });
    }

    // Recalculate total points
    const totalResult = await PointsLedger.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);

    user.totalPoints = totalResult.length > 0 ? totalResult[0].total : 0;
    user.level = calcLevel(user.totalPoints);

    // Check and award badges
    const newBadges = await checkAndAwardBadges(user);

    await user.save();

    res.status(201).json({
      attempt: {
        _id: attempt._id,
        score,
        totalQuestions: questions.length,
        pointsEarned: pointsEarned + streakBonus,
        timeTaken: attempt.timeTaken,
      },
      results,
      streak: user.streak,
      streakBonus,
      totalPoints: user.totalPoints,
      level: user.level,
      newBadges,
    });
  } catch (err) {
    console.error('SubmitAttempt error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check and award badges
async function checkAndAwardBadges(user) {
  const allBadges = await Badge.find();
  const newBadges = [];

  for (const badge of allBadges) {
    // Skip if user already has this badge
    if (user.badges.some((b) => b.toString() === badge._id.toString())) {
      continue;
    }

    let earned = false;

    switch (badge.criteria.type) {
      case 'quizzes_completed': {
        const count = await Attempt.countDocuments({ userId: user._id });
        if (count >= badge.criteria.threshold) earned = true;
        break;
      }
      case 'points_total': {
        if (user.totalPoints >= badge.criteria.threshold) earned = true;
        break;
      }
      case 'streak_days': {
        if (user.streak >= badge.criteria.threshold) earned = true;
        break;
      }
      case 'perfect_score': {
        const perfects = await Attempt.countDocuments({
          userId: user._id,
          $expr: { $eq: ['$score', '$totalQuestions'] },
        });
        if (perfects >= badge.criteria.threshold) earned = true;
        break;
      }
      default:
        break;
    }

    if (earned) {
      user.badges.push(badge._id);
      newBadges.push(badge);

      // Award badge bonus points
      if (badge.points > 0) {
        await PointsLedger.create({
          userId: user._id,
          source: 'badge',
          sourceId: badge._id,
          points: badge.points,
          description: `Badge: ${badge.name.en}`,
        });
        user.totalPoints += badge.points;
      }
    }
  }

  return newBadges;
}

// @desc    Get student's attempt history
// @route   GET /api/attempts/my
// @access  Private/Student
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user._id })
      .populate({
        path: 'quizId',
        select: 'title level subjectId',
        populate: { path: 'subjectId', select: 'name slug icon' },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(attempts);
  } catch (err) {
    console.error('GetMyAttempts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitAttempt, getMyAttempts };
