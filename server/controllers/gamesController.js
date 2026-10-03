const GameQuestion = require('../models/GameQuestion');
const PointsLedger = require('../models/PointsLedger');
const User = require('../models/User');

// @desc    Get questions for a specific game
// @route   GET /api/games/:gameSlug/questions
// @access  Private/Student
const getGameQuestions = async (req, res) => {
  try {
    const { gameSlug } = req.params;
    const { difficulty, limit = 10 } = req.query;

    const query = { gameSlug };
    if (difficulty) query.difficulty = difficulty;

    // Use MongoDB aggregation to get random questions
    const questions = await GameQuestion.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } }
    ]);

    res.json(questions);
  } catch (err) {
    console.error('GetGameQuestions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit game score and award XP
// @route   POST /api/games/submit
// @access  Private/Student
const submitGameScore = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { gameSlug, xpEarned, correctAnswers, totalQuestions } = req.body;

    if (xpEarned > 0) {
      await PointsLedger.create({
        userId: studentId,
        points: xpEarned,
        source: 'game',
        description: `Played game: ${gameSlug} (${correctAnswers}/${totalQuestions})`,
      });

      await User.findByIdAndUpdate(studentId, {
        $inc: { totalPoints: xpEarned },
      });
    }

    res.json({ success: true, xpAwarded: xpEarned });
  } catch (err) {
    console.error('SubmitGameScore error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getGameQuestions, submitGameScore };
