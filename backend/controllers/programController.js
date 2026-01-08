const Program = require('../models/Program');
const Discipline = require('../models/Discipline');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private/Admin
const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate({
        path: 'discipline',
        select: 'name department',
        populate: { path: 'department', select: 'name' },
      })
      .populate({ path: 'department', select: 'name' })
      .sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private/Admin
const createProgram = async (req, res) => {
  try {
    const { level, discipline } = req.body;

    if (!level || !discipline) {
      return res.status(400).json({ message: 'Level and discipline are required' });
    }

    const disc = await Discipline.findById(discipline).populate('department');
    if (!disc) {
      return res.status(404).json({ message: 'Discipline not found' });
    }

    const program = await Program.create({
      level,
      discipline,
      department: disc.department,
    });

    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private/Admin
const updateProgram = async (req, res) => {
  try {
    const { level, discipline } = req.body;

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    if (level !== undefined) program.level = level;

    if (discipline) {
      const disc = await Discipline.findById(discipline);
      if (!disc) {
        return res.status(404).json({ message: 'Discipline not found' });
      }
      program.discipline = discipline;
      program.department = disc.department;
    }

    await program.save();
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    await Program.findByIdAndDelete(req.params.id);
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
};
