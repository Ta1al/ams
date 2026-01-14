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

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
    default: 100,
  },
  assignmentType: {
    type: String,
    enum: ['homework', 'quiz', 'project', 'exam', 'other'],
    default: 'homework',
  },
  attachments: {
    type: [attachmentSchema],
    default: [],
  },
  instructions: {
    type: String,
    default: '',
  },
  allowLateSubmissions: {
    type: Boolean,
    default: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ assignedBy: 1 });

assignmentSchema.virtual('isOverdue').get(function () {
  return new Date() > this.dueDate;
});

module.exports = mongoose.model('Assignment', assignmentSchema);
