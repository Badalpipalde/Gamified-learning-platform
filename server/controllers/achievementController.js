const Achievement = require('../models/Achievement');
const User = require('../models/User');

// @desc    Get all achievements
// @route   GET /api/achievements
exports.getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({ rarity: 1 });

    // Mark which ones the user has unlocked
    const userAchievements = achievements.map(a => ({
      ...a.toObject(),
      unlocked: a.unlockedBy.includes(req.user._id)
    }));

    res.json({ success: true, achievements: userAchievements });
  } catch (error) {
    next(error);
  }
};

// @desc    Check and unlock achievements
// @route   POST /api/achievements/check
exports.checkAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const achievements = await Achievement.find({
      _id: { $nin: user.badges }
    });

    const newlyUnlocked = [];

    for (const achievement of achievements) {
      let qualified = false;
      const req_type = achievement.requirement?.type;
      const req_value = achievement.requirement?.value;

      switch (req_type) {
        case 'lessons_completed':
          qualified = user.completedLessons.length >= req_value;
          break;
        case 'streak_days':
          qualified = user.streak.current >= req_value;
          break;
        case 'xp_earned':
          qualified = user.xp >= req_value;
          break;
        case 'coins_earned':
          qualified = user.coins >= req_value;
          break;
        default:
          break;
      }

      if (qualified) {
        user.badges.push(achievement._id);
        user.xp += achievement.xpReward;
        user.coins += achievement.coinReward;
        achievement.unlockedBy.push(user._id);
        await achievement.save();
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      user.level = user.calculateLevel();
      await user.save();
    }

    res.json({
      success: true,
      newlyUnlocked,
      totalBadges: user.badges.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create achievement (admin/teacher)
// @route   POST /api/achievements
exports.createAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json({ success: true, achievement });
  } catch (error) {
    next(error);
  }
};
