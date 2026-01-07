const Department = require('../models/Department');
const Faculty = require('../models/Faculty');

// @desc    Get all departments (optional: ?facultyId=...)
// @route   GET /api/departments
// @access  Public/Protected
const getDepartments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.facultyId) {
      filter.faculty = req.query.facultyId;
    }

    const departments = await Department.find(filter).populate('faculty', 'name');
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
    const { name, facultyId, headOfDepartment } = req.body;

    if (!name || !facultyId) {
      return res.status(400).json({ message: 'Name and Faculty ID are required' });
    }

    // Verify Faculty exists
    const facultyExists = await Faculty.findById(facultyId);
    if (!facultyExists) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const department = await Department.create({
      name,
      faculty: facultyId,
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
