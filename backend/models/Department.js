const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Department of Computer Science"
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: false,
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to a User with a role suitable for HOD
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Department', departmentSchema);
