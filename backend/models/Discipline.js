const mongoose = require('mongoose');

const disciplineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Data Science", "Artificial Intelligence"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
}, {
  timestamps: true,
});

disciplineSchema.index({ name: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Discipline', disciplineSchema);
