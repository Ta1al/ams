const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Bachelor of Science in Artificial Intelligence"
  },
  level: {
    type: String,
    enum: ['BS', 'MS', 'PhD'], 
    required: true,
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Program', programSchema);
