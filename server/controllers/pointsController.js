const User = require('../models/User');
const PointsLedger = require('../models/PointsLedger');
const Badge = require('../models/Badge');
const Attempt = require('../models/Attempt');

// @desc    Get current student's points summary
// @route   GET /api/points/me
// @access  Private/Student
const getMyPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');

    // Recent transactions
    const recentLedger = await PointsLedger.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Points by source
    const pointsBySource = await PointsLedger.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$source', total: { $sum: '$points' } } },
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
      .limit(50);

    // Add rank
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
    const badges = await Badge.find().sort({ 'criteria.threshold': 1 });

    // If student, mark which ones they have
    if (req.user.role === 'student') {
      const user = await User.findById(req.user._id);
      const userBadgeIds = user.badges.map((b) => b.toString());

      const badgesWithStatus = badges.map((b) => ({
        ...b.toObject(),
        earned: userBadgeIds.includes(b._id.toString()),
      }));

      return res.json(badgesWithStatus);
    }

    res.json(badges);
  } catch (err) {
    console.error('GetBadges error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyPoints, getLeaderboard, getBadges };
