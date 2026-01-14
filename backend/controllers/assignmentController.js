const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

const { isValidObjectId } = mongoose;

// Helper: Check if user is teacher of a course
const ensureCourseTeacher = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) return { ok: false, status: 404, message: 'Course not found' };
  if (String(course.teacher) !== String(userId)) {
    return { ok: false, status: 403, message: 'Not authorized - you are not the teacher of this course' };
  }
  return { ok: true, course };
};

// @desc    Create assignment (auto-create submissions for enrolled students)
// @route   POST /api/assignments
// @access  Private/Teacher
const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, totalPoints = 100, assignmentType = 'homework' } = req.body;

    if (!title || !description || !courseId || !dueDate) {
      return res.status(400).json({ message: 'title, description, courseId, dueDate are required' });
    }

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Verify teacher owns the course
    const checkTeacher = await ensureCourseTeacher(courseId, req.user._id);
    if (!checkTeacher.ok) {
      return res.status(checkTeacher.status).json({ message: checkTeacher.message });
    }

    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      assignedBy: req.user._id,
      dueDate,
      totalPoints,
      assignmentType,
    });

    // Auto-create submissions for all enrolled students
    const course = checkTeacher.course;
    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      const submissions = course.enrolledStudents.map((studentId) => ({
        assignment: assignment._id,
        student: studentId,
        status: 'assigned',
      }));
      await Submission.insertMany(submissions);
    }

    const populatedAssignment = await assignment.populate('course assignedBy');

    return res.status(201).json({
      ...populatedAssignment.toObject(),
      submissionsCreated: course.enrolledStudents?.length || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, sortBy = 'dueDate' } = req.query;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization: teacher of course, enrolled student, or admin
    if (req.user.role !== 'admin') {
      if (req.user.role === 'teacher' && String(course.teacher) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (req.user.role === 'student') {
        if (!course.enrolledStudents.includes(req.user._id)) {
          return res.status(403).json({ message: 'Not enrolled in this course' });
        }
      }
    }

    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'student') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let filter = { course: courseId };

    // Filter by status (upcoming, past, etc.)
    if (status === 'upcoming') {
      filter.dueDate = { $gte: new Date() };
    } else if (status === 'past') {
      filter.dueDate = { $lt: new Date() };
    }

    const assignments = await Assignment.find(filter)
      .populate('course')
      .populate('assignedBy', 'name username')
      .sort({ [sortBy]: 1 });

    return res.status(200).json(assignments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID' });
    }

    const assignment = await Assignment.findById(id)
      .populate('course')
      .populate('assignedBy', 'name username');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization
    const course = assignment.course;
    if (req.user.role !== 'admin') {
      if (req.user.role === 'teacher' && String(course.teacher) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (req.user.role === 'student') {
        if (!course.enrolledStudents.includes(req.user._id)) {
          return res.status(403).json({ message: 'Not enrolled in this course' });
        }
      }
    }

    return res.status(200).json(assignment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify teacher owns the assignment (or admin)
    if (req.user.role !== 'admin' && String(assignment.assignedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'dueDate', 'totalPoints', 'assignmentType', 'allowLateSubmissions', 'isPublished'];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        assignment[key] = req.body[key];
      }
    });

    const updated = await assignment.save();
    const populated = await updated.populate('course assignedBy');

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assignment and related submissions
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify teacher owns the assignment (or admin)
    if (req.user.role !== 'admin' && String(assignment.assignedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignment: id });

    // Delete assignment
    await assignment.deleteOne();

    return res.status(200).json({ id, message: 'Assignment deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Teacher
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, sortBy = 'submittedAt' } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID' });
    }

    const assignment = await Assignment.findById(id).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only teacher of course or admin can view
    if (req.user.role !== 'admin' && String(assignment.course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let filter = { assignment: id };
    if (status) {
      filter.status = status;
    }

    const submissions = await Submission.find(filter)
      .populate('student', 'name username')
      .populate('gradedBy', 'name username')
      .sort({ [sortBy]: -1 });

    // Calculate stats
    const stats = {
      total: submissions.length,
      submitted: submissions.filter((s) => ['submitted', 'graded', 'returned'].includes(s.status)).length,
      graded: submissions.filter((s) => s.status === 'graded' || s.status === 'returned').length,
      pending: submissions.filter((s) => s.status === 'submitted').length,
      averageGrade:
        submissions.filter((s) => s.grade !== null).length > 0
          ? (submissions.reduce((sum, s) => sum + (s.grade || 0), 0) /
              submissions.filter((s) => s.grade !== null).length)
              .toFixed(2)
          : 0,
    };
    stats.submissionRate = ((stats.submitted / stats.total) * 100).toFixed(2);

    return res.status(200).json({
      assignment,
      submissions,
      stats,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
};
