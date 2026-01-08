const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Bachelor of Science in Artificial Intelligence"
  },
  level: {
    type: String,
    enum: ['BS', 'MS', 'MPhil', 'MBA', 'PhD', 'Diploma'],
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  }
}, {
  timestamps: true,
});

programSchema.index({ name: 1, level: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Program', programSchema);
