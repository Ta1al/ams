const Course = require('../models/Course');
const { validateCourseHierarchy } = require('../utils/validateCourseHierarchy');
const User = require('../models/User');

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
        select: 'level discipline department',
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
        select: 'level discipline department',
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

// Helpers
const ensureCourseAccess = (course, user) => {
  if (!course) return { ok: false, status: 404, message: 'Course not found' };
  if (user.role === 'admin') return { ok: true };
  if (user.role === 'teacher' && String(course.teacher) === String(user._id)) {
    return { ok: true };
  }
  return { ok: false, status: 403, message: 'Not authorized for this course' };
};

const enrollStudents = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds array is required' });
    }

    const course = await Course.findById(id);
    const access = ensureCourseAccess(course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    }).select('_id program');

    if (students.length === 0) {
      return res.status(400).json({ message: 'No valid students found' });
    }

    const invalid = students.filter((s) => String(s.program) !== String(course.program));
    if (invalid.length) {
      return res.status(400).json({ message: 'One or more students are not in the course program' });
    }

    const result = await Course.findByIdAndUpdate(
      id,
      { $addToSet: { enrolledStudents: { $each: students.map((s) => s._id) } } },
      { new: true }
    ).populate('enrolledStudents', 'name email role');

    return res.status(200).json({
      message: `${students.length} students enrolled successfully`,
      course: result,
      enrolledCount: students.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const bulkEnrollByProgram = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const { programId } = req.body;

    const course = await Course.findById(id);
    const access = ensureCourseAccess(course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const targetProgram = programId || course.program;

    if (String(course.program) !== String(targetProgram)) {
      return res.status(400).json({ message: 'Program does not match course program' });
    }

    const students = await User.find({ role: 'student', program: targetProgram }).select('_id');

    if (!students.length) {
      return res.status(400).json({ message: 'No students found for the specified program' });
    }

    const result = await Course.findByIdAndUpdate(
      id,
      { $addToSet: { enrolledStudents: { $each: students.map((s) => s._id) } } },
      { new: true }
    ).populate('enrolledStudents', 'name email role');

    return res.status(200).json({
      message: `${students.length} students enrolled successfully`,
      course: result,
      enrolledCount: students.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const unenrollStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const course = await Course.findById(id);
    const access = ensureCourseAccess(course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    await Course.findByIdAndUpdate(id, { $pull: { enrolledStudents: studentId } });
    return res.status(200).json({ message: 'Student unenrolled', studentId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getEnrolledStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('enrolledStudents', 'name email role program');
    const access = ensureCourseAccess(course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    return res.status(200).json(course.enrolledStudents || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const isSelf = String(req.user._id) === String(studentId);
    const isAdmin = req.user.role === 'admin';
    const isTeacher = req.user.role === 'teacher';

    if (!isSelf && !isAdmin && !isTeacher) {
      return res.status(403).json({ message: 'Not authorized to view this student courses' });
    }

    const filter = { enrolledStudents: studentId };
    if (isTeacher && !isAdmin) {
      filter.teacher = req.user._id;
    }

    const courses = await Course.find(filter)
      .populate('department', 'name')
      .populate('discipline', 'name')
      .populate({
        path: 'program',
        select: 'level discipline department',
        populate: { path: 'discipline', select: 'name department' },
      })
      .populate('teacher', 'name username role')
      .populate('enrolledStudents', 'name email role');

    return res.status(200).json(courses);
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
  enrollStudents,
  bulkEnrollByProgram,
  unenrollStudent,
  getEnrolledStudents,
  getStudentCourses,
};
