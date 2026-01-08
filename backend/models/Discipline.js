const mongoose = require('mongoose');

const disciplineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Data Science", "Artificial Intelligence"
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
}, {
  timestamps: true,
});

disciplineSchema.index({ name: 1, program: 1 }, { unique: true });

module.exports = mongoose.model('Discipline', disciplineSchema);
