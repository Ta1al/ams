const Program = require('../models/Program');
const Division = require('../models/Division');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private/Admin
const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate({
        path: 'division',
        select: 'name department',
        populate: {
          path: 'department',
          select: 'name',
        },
      })
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
    const { name, level, division } = req.body;

    const program = await Program.create({
      name,
      level,
      division,
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
    const { name, level, division } = req.body;

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    program.name = name || program.name;
    program.level = level || program.level;
    program.division = division || program.division;

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

// @desc    Get all divisions (for dropdown)
// @route   GET /api/programs/divisions
// @access  Private/Admin
const getDivisions = async (req, res) => {
  try {
    const divisions = await Division.find()
      .populate('department', 'name')
      .sort({ name: 1 });
    res.json(divisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getDivisions,
};
