const mongoose = require('mongoose');

const parentLinkSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate links
parentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ParentLink', parentLinkSchema);
