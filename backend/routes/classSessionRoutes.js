const express = require('express');
const router = express.Router();

const {
  getSessions,
  createSession,
  createRecurringSessions,
  rescheduleSession,
  updateSessionStatus,
} = require('../controllers/classSessionController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('teacher', 'admin'), getSessions);
router.post('/', authorize('teacher', 'admin'), createSession);
router.post('/recurring', authorize('teacher', 'admin'), createRecurringSessions);
router.put('/:id/reschedule', authorize('teacher', 'admin'), rescheduleSession);
router.put('/:id/status', authorize('teacher', 'admin'), updateSessionStatus);

module.exports = router;
