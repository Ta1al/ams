const ClassModel = require('../models/Class');
const { validateClassHierarchy } = require('../utils/validateClassHierarchy');
const User = require('../models/User');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const parseYear = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (!Number.isInteger(num)) return undefined;
  return num;
};

// @desc    Get classes (optionally filtered)
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
  try {
    const filter = {};

    if (req.query.department) filter.department = req.query.department;
    if (req.query.discipline) filter.discipline = req.query.discipline;
    if (req.query.program) filter.program = req.query.program;
    if (req.query.section) filter.section = req.query.section;

    const startYear = parseYear(req.query.startYear);
    const endYear = parseYear(req.query.endYear);
    if (startYear !== undefined) filter['session.startYear'] = startYear;
    if (endYear !== undefined) filter['session.endYear'] = endYear;

    if (req.user.role === 'student') {
      if (req.user.program) {
        filter.program = req.user.program;
      } else {
        return res.status(200).json([]);
      }
    }

    const classes = await ClassModel.find(filter)
      .populate('department', 'name')
      .populate('discipline', 'name')
      .populate({
        path: 'program',
        select: 'program discipline',
        populate: { path: 'discipline', select: 'name department' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(classes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get class by id
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid class id' });
    }

    const classDoc = await ClassModel.findById(id)
      .populate('department', 'name')
      .populate('discipline', 'name')
      .populate({
        path: 'program',
        select: 'program discipline',
        populate: { path: 'discipline', select: 'name department' },
      });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (req.user.role === 'student') {
      if (!req.user.program || String(classDoc.program) !== String(req.user.program)) {
        return res.status(403).json({ message: 'Not authorized to access this class' });
      }
    }

    return res.status(200).json(classDoc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res) => {
  try {
    const { department, program, session, section } = req.body;
    const discipline = req.body.discipline;

    const startYear = session?.startYear;
    const endYear = session?.endYear;

    if (!department || !discipline || !program || !section || startYear === undefined || endYear === undefined) {
      return res.status(400).json({
        message: 'department, discipline, program, section, session.startYear, session.endYear are required',
      });
    }

    const validation = await validateClassHierarchy({ department, discipline, program });
    if (!validation.ok) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const created = await ClassModel.create({
      department,
      discipline,
      program,
      section,
      session: { startYear, endYear },
    });

    return res.status(201).json(created);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Class already exists' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid class id' });
    }

    const classDoc = await ClassModel.findById(id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const allowedFields = ['department', 'discipline', 'program', 'section'];
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        classDoc[key] = req.body[key];
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'session')) {
      const startYear = req.body.session?.startYear;
      const endYear = req.body.session?.endYear;

      if (startYear !== undefined) classDoc.session.startYear = startYear;
      if (endYear !== undefined) classDoc.session.endYear = endYear;
    }

    const needsHierarchyValidation = ['department', 'discipline', 'program'].some(
      (key) => Object.prototype.hasOwnProperty.call(req.body, key)
    );
    if (needsHierarchyValidation) {
      const validation = await validateClassHierarchy({
        department: classDoc.department,
        discipline: classDoc.discipline,
        program: classDoc.program,
      });
      if (!validation.ok) {
        return res.status(validation.status).json({ message: validation.message });
      }
    }

    const updated = await classDoc.save();
    return res.status(200).json(updated);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Class already exists' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid class id' });
    }

    const classDoc = await ClassModel.findById(id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await classDoc.deleteOne();
    return res.status(200).json({ id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClasses,
  getClassById,
  getClassStudents,
  createClass,
  updateClass,
  deleteClass,
};

// @desc    Get students for a class
// @route   GET /api/classes/:id/students
// @access  Private (Teacher/Admin)
async function getClassStudents(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid class id' });
    }

    const classDoc = await ClassModel.findById(id).select('department program');
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (req.user.role === 'teacher') {
      if (req.user.department && String(req.user.department) !== String(classDoc.department)) {
        return res.status(403).json({ message: 'Not authorized to access this class' });
      }
    }

    const students = await User.find({ role: 'student', class: id })
      .select('-password')
      .populate({
        path: 'program',
        select: 'program discipline',
        populate: { path: 'discipline', select: 'name department' },
      })
      .populate({
        path: 'class',
        select: 'section session program discipline department',
        populate: {
          path: 'program',
          select: 'program discipline',
          populate: { path: 'discipline', select: 'name department' },
        },
      })
      .sort({ name: 1 });

    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
