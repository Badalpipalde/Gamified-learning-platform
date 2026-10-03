const mongoose = require('mongoose');

const gameQuestionSchema = new mongoose.Schema(
  {
    subjectSlug: {
      type: String,
      required: true,
      index: true,
    },
    gameSlug: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    // The main challenge text or data
    question: {
      type: String,
      required: true,
    },
    // Used for Math Battle, Science Quiz, Hindi Word Match, GK Rapid Fire
    options: {
      type: [String],
    },
    // Used for Math Battle, Science Quiz, Hindi Word Match, GK Rapid Fire
    answer: {
      type: String,
    },
    // Used for Word Builder (e.g. jumbled letters or target word)
    // For Word Builder, 'question' can be the jumbled letters, 'answer' the correct word.
    
    // Used for Code Blocks
    // 'question' can be "Arrange to print Hello", 'options' can be code snippets, 'answer' could be the ordered indices
    codeBlocks: {
      type: [String],
    },
    correctOrder: {
      type: [Number],
    },
    
    xp: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameQuestion', gameQuestionSchema);
