const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    answers: {
      type: [Number],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // seconds
      default: 0,
    },
    syncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

attemptSchema.index({ userId: 1, quizId: 1 });
attemptSchema.index({ userId: 1, createdAt: -1 });
attemptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
