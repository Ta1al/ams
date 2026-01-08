const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public/Protected
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res) => {
  try {
    const { name, headOfDepartment } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const department = await Department.create({
      name,
      headOfDepartment: headOfDepartment || null,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await department.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  deleteDepartment,
};
