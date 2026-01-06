const express = require('express');
const router = express.Router();
const {
  getFaculties,
  createFaculty,
  deleteFaculty,
} = require('../controllers/facultyController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getFaculties)
  .post(protect, adminOnly, createFaculty);

router.route('/:id')
  .delete(protect, adminOnly, deleteFaculty);

module.exports = router;
