const Program = require('../models/Program');
const Department = require('../models/Department');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private/Admin
const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate({
        path: 'department',
        select: 'name',
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
    const { name, level, department } = req.body;

    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const program = await Program.create({
      name,
      level,
      department,
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
    const { name, level, department } = req.body;

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    program.name = name || program.name;
    program.level = level || program.level;
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found' });
      }
      program.department = department;
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

// @desc    Get all departments (for dropdown)
// @route   GET /api/programs/departments
// @access  Private/Admin
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getDepartments,
};
