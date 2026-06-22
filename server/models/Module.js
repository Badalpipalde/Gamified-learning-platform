const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  grade: {
    type: Number,
    required: [true, 'Grade is required'],
    min: 1,
    max: 12
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
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
  descriptionHi: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  subjects: [{
    type: String,
    enum: ['mathematics', 'science', 'english', 'hindi', 'social_studies', 'computer_science', 'environmental_studies']
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

moduleSchema.index({ grade: 1 }, { unique: true });

module.exports = mongoose.model('Module', moduleSchema);
