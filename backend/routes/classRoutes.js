const express = require('express');
const router = express.Router();

const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getClasses)
  .post(protect, adminOnly, createClass);

router.route('/:id')
  .get(protect, getClassById)
  .put(protect, adminOnly, updateClass)
  .delete(protect, adminOnly, deleteClass);

module.exports = router;
