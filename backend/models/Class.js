const mongoose = require('mongoose');

const SECTION_VALUES = ['Regular', 'Self Support 1', 'Self Support 2'];

const classSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  session: {
    startYear: {
      type: Number,
      required: true,
      min: 1900,
      max: 2100,
    },
    endYear: {
      type: Number,
      required: true,
      min: 1900,
      max: 2100,
    },
  },
  section: {
    type: String,
    required: true,
    enum: SECTION_VALUES,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

classSchema.virtual('sessionLabel').get(function () {
  if (!this.session || !this.session.startYear || !this.session.endYear) return undefined;
  return `${this.session.startYear}-${this.session.endYear}`;
});

classSchema.pre('validate', function (next) {
  if (this.session && this.session.startYear && this.session.endYear) {
    if (Number(this.session.endYear) <= Number(this.session.startYear)) {
      this.invalidate('session.endYear', 'endYear must be greater than startYear');
    }
  }
  next();
});

classSchema.index(
  { program: 1, 'session.startYear': 1, 'session.endYear': 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model('Class', classSchema);
