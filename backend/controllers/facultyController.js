const Faculty = require('../models/Faculty');

const warnDeprecated = () => {
  if (process.env.SUPPRESS_DEPRECATION_WARNINGS === '1') return;
  console.warn('[DEPRECATED] /api/faculties endpoints are not used by current frontend/scripts.');
};

// @desc    Get all faculties
// @route   GET /api/faculties
// @access  Public
const getFaculties = async (req, res) => {
  try {
    warnDeprecated();
    const faculties = await Faculty.find();
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new faculty
// @route   POST /api/faculties
// @access  Private/Admin
const createFaculty = async (req, res) => {
  try {
    warnDeprecated();
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please add a faculty name' });
    }

    // Check if faculty already exists
    const facultyExists = await Faculty.findOne({ name });

    if (facultyExists) {
      return res.status(400).json({ message: 'Faculty already exists' });
    }

    const faculty = await Faculty.create({
      name,
    });

    res.status(201).json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a faculty
// @route   DELETE /api/faculties/:id
// @access  Private/Admin
const deleteFaculty = async (req, res) => {
  try {
    warnDeprecated();
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    await faculty.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFaculties,
  createFaculty,
  deleteFaculty,
};
