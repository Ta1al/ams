const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true, // e.g., "Faculty of Computing"
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Faculty', facultySchema);
