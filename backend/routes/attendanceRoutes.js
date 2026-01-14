const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceForCourse,
  getStudentAttendance,
  getMyAttendance,
  updateAttendance,
  deleteAttendance,
  getCourseStats,
  generateReport,
} = require('../controllers/attendanceController');
const { protect, authorize, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('teacher', 'admin'), markAttendance);
router.get('/course/:courseId', authorize('teacher', 'admin'), getAttendanceForCourse);
router.get('/student/:studentId', getStudentAttendance);
router.get('/my-attendance', getMyAttendance);
router.put('/:id', authorize('teacher', 'admin'), updateAttendance);
router.delete('/:id', authorize('teacher', 'admin'), deleteAttendance);
router.get('/stats/:courseId', authorize('teacher', 'admin'), getCourseStats);
router.get('/report', adminOnly, generateReport);

module.exports = router;
