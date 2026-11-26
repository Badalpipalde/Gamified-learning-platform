const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const PointsLedger = require('../models/PointsLedger');
const Badge = require('../models/Badge');
const User = require('../models/User');

const POINTS_PER_CORRECT = 10;
const STREAK_BONUS = 5; // bonus per streak day milestone

const BADGES_CACHE_TTL_MS = 300_000;
let badgesCache = { data: null, expiresAt: 0 };

async function fetchBadgesCached() {
  if (badgesCache.data && badgesCache.expiresAt > Date.now()) {
    return badgesCache.data;
  }
  const badges = await Badge.find().sort({ 'criteria.threshold': 1 }).lean();
  badgesCache = { data: badges, expiresAt: Date.now() + BADGES_CACHE_TTL_MS };
  return badges;
}

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

    // Fetch quiz and its questions in parallel
    const [quiz, questions] = await Promise.all([
      Quiz.findById(quizId).select('title').lean(),
      Question.find({ quizId }).sort({ _id: 1 }).lean(),
    ]);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

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

    // Add to points ledger and load user in parallel
    const [, user] = await Promise.all([
      pointsEarned > 0
        ? PointsLedger.create({
            userId,
            source: 'quiz',
            sourceId: attempt._id,
            points: pointsEarned,
            description: `Quiz: ${quiz.title.en}`,
          })
        : Promise.resolve(null),
      User.findById(userId),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakBonus = 0;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = new Date();

    // Streak milestones: 3, 7, 14, 30
    const streakMilestones = [3, 7, 14, 30];
    const streakPromise = streakMilestones.includes(user.streak)
      ? (() => {
          streakBonus = user.streak * STREAK_BONUS;
          return PointsLedger.create({
            userId,
            source: 'streak',
            points: streakBonus,
            description: `${user.streak}-day streak bonus`,
          });
        })()
      : Promise.resolve(null);

    await streakPromise;

    // Recalculate total points and fetch cached badges in parallel
    const [totalResult, allBadges] = await Promise.all([
      PointsLedger.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: '$points' } } },
      ]),
      fetchBadgesCached(),
    ]);

    user.totalPoints = totalResult.length > 0 ? totalResult[0].total : 0;
    user.level = calcLevel(user.totalPoints);

    // Check and award badges
    const newBadges = await checkAndAwardBadges(user, allBadges);

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

// Check and award badges without per-badge N+1 count queries
async function checkAndAwardBadges(user, allBadges) {
  const existingSet = new Set(user.badges.map((b) => b.toString()));
  const unearnedBadges = allBadges.filter((b) => !existingSet.has(b._id.toString()));
  if (unearnedBadges.length === 0) return [];

  const needsQuizCount = unearnedBadges.some((b) => b.criteria?.type === 'quizzes_completed');
  const needsPerfectCount = unearnedBadges.some((b) => b.criteria?.type === 'perfect_score');

  const [quizzesCount, perfectsCount] = await Promise.all([
    needsQuizCount ? Attempt.countDocuments({ userId: user._id }) : Promise.resolve(0),
    needsPerfectCount
      ? Attempt.countDocuments({
          userId: user._id,
          $expr: { $eq: ['$score', '$totalQuestions'] },
        })
      : Promise.resolve(0),
  ]);

  const newBadges = [];
  const ledgerDocs = [];

  for (const badge of unearnedBadges) {
    let earned = false;

    switch (badge.criteria.type) {
      case 'quizzes_completed':
        if (quizzesCount >= badge.criteria.threshold) earned = true;
        break;
      case 'points_total':
        if (user.totalPoints >= badge.criteria.threshold) earned = true;
        break;
      case 'streak_days':
        if (user.streak >= badge.criteria.threshold) earned = true;
        break;
      case 'perfect_score':
        if (perfectsCount >= badge.criteria.threshold) earned = true;
        break;
      default:
        break;
    }

    if (earned) {
      user.badges.push(badge._id);
      newBadges.push(badge);

      if (badge.points > 0) {
        ledgerDocs.push({
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

  if (ledgerDocs.length > 0) {
    await PointsLedger.insertMany(ledgerDocs);
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
      .limit(50)
      .lean();

    res.json(attempts);
  } catch (err) {
    console.error('GetMyAttempts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitAttempt, getMyAttempts };
