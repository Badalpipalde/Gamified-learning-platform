const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  titleHi: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  descriptionHi: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    enum: ['mathematics', 'science', 'english', 'hindi', 'social_studies', 'computer_science', 'environmental_studies']
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  videoUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  contentHi: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  xpReward: {
    type: Number,
    default: 50
  },
  coinReward: {
    type: Number,
    default: 10
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

lessonSchema.index({ subject: 1, grade: 1 });
lessonSchema.index({ teacher: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
