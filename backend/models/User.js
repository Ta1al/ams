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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    // relevant for teachers/staff
  },
}, {
  timestamps: true,
});

// Backwards compatibility: older code may read/write `email`
userSchema.virtual('email')
  .get(function () {
    return this.username;
  })
  .set(function (value) {
    this.username = value;
  });

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
