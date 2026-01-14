const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  fileSize: Number,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  _id: false,
});

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['assigned', 'submitted', 'graded', 'returned'],
    default: 'assigned',
  },
  submittedAt: {
    type: Date,
  },
  submissionText: {
    type: String,
    default: '',
  },
  attachments: {
    type: [attachmentSchema],
    default: [],
  },
  grade: {
    type: Number,
    min: 0,
    default: null,
  },
  feedback: {
    type: String,
    default: '',
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gradedAt: {
    type: Date,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, status: 1 });
submissionSchema.index({ assignment: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
