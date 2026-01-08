const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student',
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    // relevant for students
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    // required for students (enforced in controllers)
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    // relevant for teachers/staff
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
