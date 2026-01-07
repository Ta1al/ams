const Division = require('../models/Division');
const Department = require('../models/Department');

// @desc    Get all divisions (optional: ?departmentId=...)
// @route   GET /api/divisions
// @access  Public/Protected
const getDivisions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) {
      filter.department = req.query.departmentId;
    }

    const divisions = await Division.find(filter).populate('department', 'name');
    res.status(200).json(divisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new division
// @route   POST /api/divisions
// @access  Private/Admin
const createDivision = async (req, res) => {
  try {
    const { name, departmentId } = req.body;

    if (!name || !departmentId) {
      return res.status(400).json({ message: 'Name and Department ID are required' });
    }

    // Verify Department exists
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const division = await Division.create({
      name,
      department: departmentId,
    });

    res.status(201).json(division);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete division
// @route   DELETE /api/divisions/:id
// @access  Private/Admin
const deleteDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);

    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }

    await division.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDivisions,
  createDivision,
  deleteDivision,
};
