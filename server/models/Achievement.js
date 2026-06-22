const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  nameHi: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  descriptionHi: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['learning', 'streak', 'social', 'quiz', 'special'],
    default: 'learning'
  },
  requirement: {
    type: { type: String, enum: ['lessons_completed', 'quizzes_passed', 'streak_days', 'xp_earned', 'posts_created', 'coins_earned'] },
    value: Number
  },
  xpReward: {
    type: Number,
    default: 200
  },
  coinReward: {
    type: Number,
    default: 50
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  unlockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);
