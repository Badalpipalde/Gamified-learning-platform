const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Answer content is required']
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const qnaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Question content is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  tags: [String],
  answers: [answerSchema],
  views: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }
}, {
  timestamps: true
});

qnaSchema.index({ subject: 1, grade: 1 });
qnaSchema.index({ author: 1 });
qnaSchema.index({ isResolved: 1, createdAt: -1 });

module.exports = mongoose.model('QnA', qnaSchema);
