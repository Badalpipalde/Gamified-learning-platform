const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all', limit = 20 } = req.query;

    let query = { role: 'student' };
    let sortField = '-xp';

    const students = await User.find(query)
      .select('name avatar xp level coins streak.current badges')
      .populate('badges', 'name icon rarity')
      .sort(sortField)
      .limit(parseInt(limit));

    // Find current user's rank
    const userRank = await User.countDocuments({
      role: 'student',
      xp: { $gt: req.user.xp }
    }) + 1;

    const leaderboard = students.map((student, index) => ({
      rank: index + 1,
      _id: student._id,
      name: student.name,
      avatar: student.avatar,
      xp: student.xp,
      level: student.level,
      coins: student.coins,
      streak: student.streak.current,
      badgeCount: student.badges.length,
      isCurrentUser: student._id.toString() === req.user._id.toString()
    }));

    res.json({
      success: true,
      userRank,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};
