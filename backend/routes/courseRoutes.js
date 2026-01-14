const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/courseController');

const { protect, adminOnly, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCourses)
  .post(protect, adminOnly, createCourse);

router.get('/student/:studentId', protect, getStudentCourses);

router.route('/:id')
  .get(protect, getCourseById)
  .put(protect, adminOnly, updateCourse)
  .delete(protect, adminOnly, deleteCourse);

router.post('/:id/enroll', protect, authorize('teacher', 'admin'), enrollStudents);
router.post('/:id/enroll-bulk', protect, authorize('teacher', 'admin'), bulkEnrollByProgram);
router.delete('/:id/unenroll/:studentId', protect, authorize('teacher', 'admin'), unenrollStudent);
router.get('/:id/students', protect, authorize('teacher', 'admin'), getEnrolledStudents);

module.exports = router;
