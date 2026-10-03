const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String, // e.g. "2, 3"
    required: true,
  },
  expectedOutput: {
    type: String, // e.g. "5"
    required: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

const codeProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    initialCode: {
      type: String,
      required: true,
    },
    testCases: [testCaseSchema],
    points: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodeProblem', codeProblemSchema);
