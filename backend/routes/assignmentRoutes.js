const express = require('express');
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Create assignment (teacher only)
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);

// Get assignments for a course
router.get('/course/:courseId', protect, getAssignments);

// Get single assignment
router.get('/:id', protect, getAssignmentById);

// Update assignment (teacher only)
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);

// Delete assignment (teacher only)
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

// Get all submissions for an assignment (teacher only)
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), getAssignmentSubmissions);

module.exports = router;
