const mongoose = require('mongoose');

const codeAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodeProblem',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'error'],
      required: true,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

codeAttemptSchema.index({ studentId: 1, status: 1, problemId: 1 });

module.exports = mongoose.model('CodeAttempt', codeAttemptSchema);
