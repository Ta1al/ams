const Course = require('../models/Course');
const { validateCourseHierarchy } = require('../utils/validateCourseHierarchy');
const User = require('../models/User');
const ClassModel = require('../models/Class');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const toIdString = (value) => {
  if (!value) return null;
  // ObjectId, populated doc, or plain string
  if (typeof value === 'string') return value;
  if (value._id) return String(value._id);
  return String(value);
};

// @desc    Get courses (optionally filtered)
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const filter = {};

    if (req.query.department) filter.department = req.query.department;
    if (req.query.discipline) filter.discipline = req.query.discipline;
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
    const { name, code, department, program, teacher, class: classId } = req.body;
    const discipline = req.body.discipline;

    if (!name || !department || !discipline || !program || !teacher || !classId) {
      return res.status(400).json({
        message: 'name, department, discipline, program, class, teacher are required',
      });
    }

    const classDoc = await ClassModel.findById(classId).select('program');
    if (!classDoc) {
      return res.status(400).json({ message: 'Class not found' });
    }
    if (String(classDoc.program) !== String(program)) {
      return res.status(400).json({ message: 'Class does not belong to the selected program' });
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
      class: classId,
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

    const allowedFields = ['name', 'code', 'department', 'discipline', 'program', 'teacher', 'class'];
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        course[key] = req.body[key];
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'class')) {
      const classDoc = await ClassModel.findById(course.class).select('program');
      if (!classDoc) {
        return res.status(400).json({ message: 'Class not found' });
      }
      if (String(classDoc.program) !== String(course.program)) {
        return res.status(400).json({ message: 'Class does not belong to the selected program' });
      }
    }

    const needsValidation = ['department', 'discipline', 'program', 'teacher'].some(
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

const ensureClassAccess = (classDoc, user) => {
  if (!classDoc) return { ok: false, status: 404, message: 'Class not found' };
  if (user.role === 'admin') return { ok: true };
  if (user.role === 'teacher') {
    if (!user.department) return { ok: true };
    if (String(user.department) === String(classDoc.department)) return { ok: true };
  }
  return { ok: false, status: 403, message: 'Not authorized for this class' };
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

    const courseProgramId = toIdString(course.program);
    const invalid = students.filter((s) => toIdString(s.program) !== courseProgramId);
    if (invalid.length) {
      return res.status(400).json({
        message: 'One or more students are not in the course program',
        courseProgramId,
        invalidStudentIds: invalid.map((s) => String(s._id)),
      });
    }

    const result = await Course.findByIdAndUpdate(
      id,
      { $addToSet: { enrolledStudents: { $each: students.map((s) => s._id) } } },
      { new: true }
    ).populate('enrolledStudents', 'name username role program');

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
    ).populate('enrolledStudents', 'name username role program');

    return res.status(200).json({
      message: `${students.length} students enrolled successfully`,
      course: result,
      enrolledCount: students.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk enroll a whole class into a course
// @route   POST /api/courses/:id/enroll-class
// @access  Private (Teacher/Admin)
const bulkEnrollByClass = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const { classId } = req.body;

    const course = await Course.findById(id);
    const access = ensureCourseAccess(course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const targetClassId = classId || course.class;
    if (!targetClassId) {
      return res.status(400).json({ message: 'classId is required (course has no class set)' });
    }

    const classDoc = await ClassModel.findById(targetClassId).select('program department');
    const classAccess = ensureClassAccess(classDoc, req.user);
    if (!classAccess.ok) return res.status(classAccess.status).json({ message: classAccess.message });

    if (String(classDoc.program) !== String(course.program)) {
      return res.status(400).json({ message: 'Class does not match course program' });
    }

    const students = await User.find({ role: 'student', class: targetClassId }).select('_id program');
    if (!students.length) {
      return res.status(400).json({ message: 'No students found for the specified class' });
    }

    const courseProgramId = toIdString(course.program);
    const invalid = students.filter((s) => toIdString(s.program) !== courseProgramId);
    if (invalid.length) {
      return res.status(400).json({
        message: 'One or more students are not in the course program',
        courseProgramId,
        invalidStudentIds: invalid.map((s) => String(s._id)),
      });
    }

    const result = await Course.findByIdAndUpdate(
      id,
      { $addToSet: { enrolledStudents: { $each: students.map((s) => s._id) } } },
      { new: true }
    ).populate('enrolledStudents', 'name username role program');

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
      .populate({
        path: 'class',
        select: 'section session program discipline department',
        populate: {
          path: 'program',
          select: 'program discipline',
          populate: { path: 'discipline', select: 'name department' },
        },
      })
      .populate('teacher', 'name username role')
      .populate('enrolledStudents', 'name username role program');

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
  bulkEnrollByClass,
  unenrollStudent,
  getEnrolledStudents,
  getStudentCourses,
};
