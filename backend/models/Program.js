const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['BS', 'MS', 'MPhil', 'MBA', 'PhD', 'Diploma'],
    required: true,
  },
  discipline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discipline',
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

programSchema.index({ level: 1, discipline: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Program', programSchema);
