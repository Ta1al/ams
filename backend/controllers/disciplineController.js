const Discipline = require('../models/Discipline');
const Program = require('../models/Program');

// @desc    Get all disciplines (optional: ?programId=...)
// @route   GET /api/disciplines
// @access  Private/Admin
const getDisciplines = async (req, res) => {
  try {
    const filter = {};
    if (req.query.programId) {
      filter.program = req.query.programId;
    }

    const disciplines = await Discipline.find(filter)
      .populate({
        path: 'program',
        select: 'name level department',
        populate: { path: 'department', select: 'name' },
      })
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
    const { name, programId } = req.body;

    if (!name || !programId) {
      return res.status(400).json({ message: 'Name and Program ID are required' });
    }

    const programExists = await Program.findById(programId);
    if (!programExists) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const discipline = await Discipline.create({
      name,
      program: programId,
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
