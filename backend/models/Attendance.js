const mongoose = require('mongoose');

const studentRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
}, {
  _id: false,
});

const attendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  session: {
    type: String,
    trim: true,
  },
  studentRecords: {
    type: [studentRecordSchema],
    default: [],
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

attendanceSchema.index({ course: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ course: 1, 'studentRecords.student': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
