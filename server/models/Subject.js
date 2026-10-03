const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: String,
      default: '📚',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
