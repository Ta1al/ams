const Course = require('../models/Course');
const { validateCourseHierarchy } = require('../utils/validateCourseHierarchy');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

// @desc    Get courses (optionally filtered)
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const filter = {};

    if (req.query.department) filter.department = req.query.department;
    if (req.query.discipline || req.query.division) filter.discipline = req.query.discipline || req.query.division;
    if (req.query.program) filter.program = req.query.program;
    if (req.query.teacher) filter.teacher = req.query.teacher;

    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    if (req.user.role === 'student') {
      // Students can only see courses in their program
      if (req.user.program) {
        filter.program = req.user.program;
      } else {
        return res.status(200).json([]);
      }
    }

    const courses = await Course.find(filter)
      .populate('department', 'name')
      .populate('discipline', 'name')
      .populate({
        path: 'program',
        select: 'program discipline',
        populate: { path: 'discipline', select: 'name department' },
      })
      .populate('teacher', 'name username role')
      .sort({ createdAt: -1 });

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get course by id
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const course = await Course.findById(id)
      .populate('department', 'name')
      .populate('discipline', 'name')
      .populate({
        path: 'program',
        select: 'program discipline',
        populate: { path: 'discipline', select: 'name department' },
      })
      .populate('teacher', 'name username role');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'teacher' && String(course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    if (req.user.role === 'student') {
      if (!req.user.program || String(course.program) !== String(req.user.program)) {
        return res.status(403).json({ message: 'Not authorized to access this course' });
      }
    }

    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const { name, code, department, program, teacher } = req.body;
    const discipline = req.body.discipline || req.body.division;

    if (!name || !department || !discipline || !program || !teacher) {
      return res.status(400).json({
        message: 'name, department, discipline, program, teacher are required',
      });
    }

    const validation = await validateCourseHierarchy({ department, discipline, program, teacher });
    if (!validation.ok) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const course = await Course.create({
      name,
      code,
      department,
      discipline,
      program,
      teacher,
    });

    return res.status(201).json(course);
  } catch (error) {
    // handle duplicate key
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Course already exists' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const allowedFields = ['name', 'code', 'department', 'discipline', 'program', 'teacher', 'division'];
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        if (key === 'division' && !Object.prototype.hasOwnProperty.call(req.body, 'discipline')) {
          course.discipline = req.body.division;
        } else if (key !== 'division') {
          course[key] = req.body[key];
        }
      }
    }

    const needsValidation = ['department', 'discipline', 'division', 'program', 'teacher'].some(
      (key) => Object.prototype.hasOwnProperty.call(req.body, key)
    );
    if (needsValidation) {
      const validation = await validateCourseHierarchy({
        department: course.department,
        discipline: course.discipline,
        program: course.program,
        teacher: course.teacher,
      });
      if (!validation.ok) {
        return res.status(validation.status).json({ message: validation.message });
      }
    }

    const updated = await course.save();
    return res.status(200).json(updated);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Course already exists' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.deleteOne();
    return res.status(200).json({ id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
