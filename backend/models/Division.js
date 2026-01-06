const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Artificial Intelligence", "Data Science"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Division', divisionSchema);
