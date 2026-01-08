const express = require('express');
const router = express.Router();
const {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getDepartments,
} = require('../controllers/programController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get('/departments', getDepartments);

router.route('/')
  .get(getPrograms)
  .post(createProgram);

router.route('/:id')
  .put(updateProgram)
  .delete(deleteProgram);

module.exports = router;
