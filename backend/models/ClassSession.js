const mongoose = require('mongoose');

const STATUS_VALUES = ['scheduled', 'active', 'completed', 'cancelled'];

const classSessionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
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
