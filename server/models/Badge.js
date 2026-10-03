const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    description: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' },
    },
    icon: {
      type: String,
      default: '🏅',
    },
    criteria: {
      type: {
        type: String,
        enum: ['quizzes_completed', 'points_total', 'streak_days', 'perfect_score', 'subject_mastery'],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
      subjectSlug: {
        type: String, // only for subject_mastery
      },
    },
    points: {
      type: Number,
      default: 0, // bonus points awarded with badge
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
