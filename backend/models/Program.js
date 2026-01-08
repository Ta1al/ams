const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  program: {
    type: String,
    enum: ['BS', 'MS', 'PhD'], 
    required: true,
  },
  discipline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
  }
}, {
  timestamps: true,
});

programSchema.index({ discipline: 1, program: 1 }, { unique: true });

module.exports = mongoose.model('Program', programSchema);
