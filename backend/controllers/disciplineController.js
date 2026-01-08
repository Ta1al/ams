const Discipline = require('../models/Discipline');
const Department = require('../models/Department');

// @desc    Get all disciplines
// @route   GET /api/disciplines
// @access  Private/Admin
const getDisciplines = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) {
      filter.department = req.query.departmentId;
    }

    const disciplines = await Discipline.find(filter)
      .populate({ path: 'department', select: 'name' })
      .sort({ name: 1 });

    res.status(200).json(disciplines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new discipline
// @route   POST /api/disciplines
// @access  Private/Admin
const createDiscipline = async (req, res) => {
  try {
    const { name, departmentId } = req.body;

    if (!name || !departmentId) {
      return res.status(400).json({ message: 'Name and Department ID are required' });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const discipline = await Discipline.create({
      name,
      department: departmentId,
    });

    res.status(201).json(discipline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete discipline
// @route   DELETE /api/disciplines/:id
// @access  Private/Admin
const deleteDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.findById(req.params.id);

    if (!discipline) {
      return res.status(404).json({ message: 'Discipline not found' });
    }

    await discipline.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDisciplines,
  createDiscipline,
  deleteDiscipline,
};
