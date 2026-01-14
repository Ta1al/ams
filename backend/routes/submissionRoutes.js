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

// Get my submissions (student)
router.get('/my-submissions', protect, getMySubmissions);

// Get submission by assignment and student
router.get('/assignment/:assignmentId/student/:studentId', protect, getSubmissionByAssignmentAndStudent);

// Get single submission
router.get('/:id', protect, getSubmission);

// Update submission (student, before grading)
router.put('/:id', protect, authorize('student'), updateSubmission);

// Grade submission (teacher)
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

// Bulk grade (teacher)
router.post('/bulk-grade', protect, authorize('teacher', 'admin'), bulkGrade);

// Get submissions for a student (teacher)
router.get('/student/:studentId', protect, authorize('teacher', 'admin'), getStudentSubmissions);

module.exports = router;
