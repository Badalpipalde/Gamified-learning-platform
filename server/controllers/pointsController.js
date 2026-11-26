const User = require('../models/User');
const PointsLedger = require('../models/PointsLedger');
const Badge = require('../models/Badge');

// @desc    Get current student's points summary
// @route   GET /api/points/me
// @access  Private/Student
const getMyPoints = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, recentLedger, pointsBySource] = await Promise.all([
      User.findById(userId)
        .select('totalPoints level streak badges')
        .populate('badges')
        .lean(),
      PointsLedger.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      PointsLedger.aggregate([
        { $match: { userId } },
        { $group: { _id: '$source', total: { $sum: '$points' } } },
      ]),
    ]);

    res.json({
      totalPoints: user.totalPoints,
      level: user.level,
      streak: user.streak,
      badges: user.badges,
      recentLedger,
      pointsBySource,
    });
  } catch (err) {
    console.error('GetMyPoints error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get class leaderboard
// @route   GET /api/leaderboard/:classId
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { classId } = req.params;

    const students = await User.find({
      classId,
      role: 'student',
      active: true,
    })
      .select('name rollNo totalPoints level streak badges')
      .sort({ totalPoints: -1 })
      .limit(50)
      .lean();

    const leaderboard = students.map((s, i) => ({
      rank: i + 1,
      _id: s._id,
      name: s.name,
      rollNo: s.rollNo,
      totalPoints: s.totalPoints,
      level: s.level,
      streak: s.streak,
      badgeCount: s.badges ? s.badges.length : 0,
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error('GetLeaderboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Private
const getBadges = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const [badges, user] = await Promise.all([
        Badge.find().sort({ 'criteria.threshold': 1 }).lean(),
        User.findById(req.user._id).select('badges').lean(),
      ]);

      const userBadgeSet = new Set((user?.badges || []).map((b) => b.toString()));

      const badgesWithStatus = badges.map((b) => ({
        ...b,
        earned: userBadgeSet.has(b._id.toString()),
      }));

      return res.json(badgesWithStatus);
    }

    const badges = await Badge.find().sort({ 'criteria.threshold': 1 }).lean();
    res.json(badges);
  } catch (err) {
    console.error('GetBadges error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyPoints, getLeaderboard, getBadges };
