const express = require('express');
const {
  createSubmission,
  getSubmission,
  getMySubmissions,
  updateSubmission,
  gradeSubmission,
  bulkGrade,
  getStudentSubmissions,
  getSubmissionByAssignmentAndStudent,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Create/submit assignment (student)
router.post('/', protect, authorize('student'), createSubmission);

// Bulk grade (teacher) - more specific, must come before /:id routes
router.post('/bulk-grade', protect, authorize('teacher', 'admin'), bulkGrade);

// Get my submissions (student) - more specific, must come before /:id routes
router.get('/my-submissions', protect, getMySubmissions);

// Get submission by assignment and student - more specific route
router.get('/assignment/:assignmentId/student/:studentId', protect, getSubmissionByAssignmentAndStudent);

// Get submissions for a student (teacher) - more specific route
router.get('/student/:studentId', protect, authorize('teacher', 'admin'), getStudentSubmissions);

// Get single submission - general route (less specific)
router.get('/:id', protect, getSubmission);

// Update submission (student, before grading)
router.put('/:id', protect, authorize('student'), updateSubmission);

// Grade submission (teacher)
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
