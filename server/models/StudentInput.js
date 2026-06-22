const mongoose = require('mongoose');

const studentInputSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['note', 'feedback', 'suggestion'],
    required: [true, 'Input type is required']
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  subject: {
    type: String,
    enum: ['mathematics', 'science', 'english', 'hindi', 'social_studies', 'computer_science', 'environmental_studies']
  },
  grade: {
    type: Number,
    min: 1,
    max: 12
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'archived'],
    default: 'pending'
  },
  teacherReply: {
    content: String,
    repliedAt: Date,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

studentInputSchema.index({ student: 1, type: 1 });
studentInputSchema.index({ lesson: 1, type: 1 });
studentInputSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('StudentInput', studentInputSchema);
