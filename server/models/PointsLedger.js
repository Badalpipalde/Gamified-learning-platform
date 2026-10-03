const mongoose = require('mongoose');

const pointsLedgerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    source: {
      type: String,
      enum: ['quiz', 'streak', 'badge', 'coding', 'bonus'],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    points: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

pointsLedgerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PointsLedger', pointsLedgerSchema);
