const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionHi: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'fill_blank'],
    default: 'mcq'
  },
  options: [{
    text: String,
    textHi: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    default: ''
  },
  explanation: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 10
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  titleHi: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 10
  },
  passingScore: {
    type: Number,
    default: 60
  },
  xpReward: {
    type: Number,
    default: 100
  },
  coinReward: {
    type: Number,
    default: 25
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  attempts: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    totalPoints: Number,
    completedAt: { type: Date, default: Date.now },
    answers: [{ questionIndex: Number, selectedOption: Number, isCorrect: Boolean }]
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
