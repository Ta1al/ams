const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

const { isValidObjectId } = mongoose;

// @desc    Create or update submission (student submits assignment)
// @route   POST /api/submissions
// @access  Private/Student
const createSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionText = '', attachments = [] } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: 'assignmentId is required' });
    }

    if (!isValidObjectId(assignmentId)) {
      return res.status(400).json({ message: 'Invalid assignment ID' });
    }

    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    if (!assignment.course.enrolledStudents.includes(req.user._id)) {
      return res.status(409).json({ message: 'Not enrolled in this course' });
    }

    // Check if late submission is allowed
    const isLate = new Date() > new Date(assignment.dueDate);
    if (isLate && !assignment.allowLateSubmissions) {
      return res.status(400).json({ message: 'Late submissions are not allowed for this assignment' });
    }

    // Find existing submission
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (submission) {
      // Check if already graded
      if (submission.status === 'graded' || submission.status === 'returned') {
        return res.status(400).json({ message: 'Cannot update submission after grading' });
      }

      // Update existing submission
      submission.submissionText = submissionText;
      submission.attachments = attachments;
      submission.submittedAt = new Date();
      submission.status = 'submitted';
      submission.isLate = isLate;
    } else {
      // Create new submission
      submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        submissionText,
        attachments,
        submittedAt: new Date(),
        status: 'submitted',
        isLate,
      });
    }

    const saved = await submission.save();
    const populated = await saved.populate('assignment student');

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific submission
// @route   GET /api/submissions/:id
// @access  Private
const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid submission ID' });
    }

    const submission = await Submission.findById(id)
      .populate('assignment')
      .populate('student', 'name username')
      .populate('gradedBy', 'name username');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Authorization: student (own submission), teacher of course, or admin
    if (req.user.role === 'student' && String(submission.student._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'teacher') {
      const course = await Course.findById(submission.assignment.course);
      if (String(course.teacher) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    return res.status(200).json(submission);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get my submissions (student)
// @route   GET /api/submissions/my-submissions
// @access  Private/Student
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment')
      .populate('gradedBy', 'name username')
      .sort({ createdAt: -1 });

    return res.status(200).json(submissions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update submission (before grading)
// @route   PUT /api/submissions/:id
// @access  Private/Student
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionText, attachments } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid submission ID' });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Only student who submitted can update, and only if not graded
    if (String(submission.student) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (submission.status === 'graded' || submission.status === 'returned') {
      return res.status(400).json({ message: 'Cannot update submission after grading' });
    }

    // Update fields
    if (submissionText !== undefined) submission.submissionText = submissionText;
    if (attachments !== undefined) submission.attachments = attachments;

    const updated = await submission.save();
    const populated = await updated.populate('assignment student gradedBy');

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Teacher
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback = '' } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid submission ID' });
    }

    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: 'grade is required' });
    }

    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify teacher is assigned to the course
    const course = await Course.findById(submission.assignment.course);
    if (req.user.role === 'teacher' && String(course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate grade
    if (grade < 0 || grade > submission.assignment.totalPoints) {
      return res.status(400).json({
        message: `Grade must be between 0 and ${submission.assignment.totalPoints}`,
      });
    }

    // Update submission
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    submission.status = 'graded';

    const updated = await submission.save();
    const populated = await updated.populate('assignment student gradedBy');

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk grade submissions
// @route   POST /api/submissions/bulk-grade
// @access  Private/Teacher
const bulkGrade = async (req, res) => {
  try {
    const { submissions: submissionGrades } = req.body;

    if (!Array.isArray(submissionGrades) || submissionGrades.length === 0) {
      return res.status(400).json({ message: 'submissions array is required' });
    }

    const results = [];
    const errors = [];

    for (const { submissionId, grade, feedback } of submissionGrades) {
      try {
        if (!isValidObjectId(submissionId)) {
          errors.push({ submissionId, error: 'Invalid submission ID' });
          continue;
        }

        const submission = await Submission.findById(submissionId).populate('assignment');
        if (!submission) {
          errors.push({ submissionId, error: 'Submission not found' });
          continue;
        }

        // Verify authorization
        const course = await Course.findById(submission.assignment.course);
        if (req.user.role === 'teacher' && String(course.teacher) !== String(req.user._id)) {
          errors.push({ submissionId, error: 'Not authorized' });
          continue;
        }

        // Validate grade
        if (grade < 0 || grade > submission.assignment.totalPoints) {
          errors.push({
            submissionId,
            error: `Grade must be between 0 and ${submission.assignment.totalPoints}`,
          });
          continue;
        }

        // Update submission
        submission.grade = grade;
        submission.feedback = feedback || '';
        submission.gradedBy = req.user._id;
        submission.gradedAt = new Date();
        submission.status = 'graded';

        const updated = await submission.save();
        results.push(updated);
      } catch (err) {
        errors.push({ submissionId, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      graded: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for a student
// @route   GET /api/submissions/student/:studentId
// @access  Private/Teacher
const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const submissions = await Submission.find({ student: studentId })
      .populate('assignment')
      .populate('gradedBy', 'name username')
      .sort({ createdAt: -1 });

    return res.status(200).json(submissions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific submission by assignment and student
// @route   GET /api/submissions/assignment/:assignmentId/student/:studentId
// @access  Private
const getSubmissionByAssignmentAndStudent = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    if (!isValidObjectId(assignmentId) || !isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'Invalid assignment or student ID' });
    }

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    })
      .populate('assignment')
      .populate('student', 'name username')
      .populate('gradedBy', 'name username');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Authorization: student (own submission), teacher of course, or admin
    if (req.user.role === 'student' && String(submission.student._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'teacher') {
      const course = await Course.findById(submission.assignment.course);
      if (String(course.teacher) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    return res.status(200).json(submission);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSubmission,
  getSubmission,
  getMySubmissions,
  updateSubmission,
  gradeSubmission,
  bulkGrade,
  getStudentSubmissions,
  getSubmissionByAssignmentAndStudent,
};
