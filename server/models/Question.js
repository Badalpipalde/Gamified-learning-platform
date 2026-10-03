const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    text: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    options: [
      {
        en: { type: String, required: true },
        hi: { type: String, required: true },
      },
    ],
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

questionSchema.index({ quizId: 1 });

module.exports = mongoose.model('Question', questionSchema);
