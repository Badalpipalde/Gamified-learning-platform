const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    title: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

quizSchema.index({ subjectId: 1, level: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
