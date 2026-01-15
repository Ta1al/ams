const mongoose = require('mongoose');

const STATUS_VALUES = ['scheduled', 'active', 'completed', 'cancelled'];

const RECURRENCE_FREQUENCIES = ['none', 'daily', 'weekly'];

const classSessionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  room: {
    type: String,
    trim: true,
    default: '',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  recurrence: {
    frequency: {
      type: String,
      enum: RECURRENCE_FREQUENCIES,
      default: 'none',
    },
    interval: {
      type: Number,
      min: 1,
      default: 1,
    },
    count: {
      type: Number,
      min: 1,
      default: 1,
    },
    until: {
      type: Date,
      required: false,
    },
  },
  status: {
    type: String,
    enum: STATUS_VALUES,
    default: 'scheduled',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rescheduleReason: {
    type: String,
    trim: true,
    default: '',
  },
  cancelledReason: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

classSessionSchema.index({ course: 1, startTime: 1 });
classSessionSchema.index({ course: 1, status: 1, startTime: 1 });

module.exports = mongoose.model('ClassSession', classSessionSchema);
