const express = require('express');
const router = express.Router();
const {
  getDivisions,
  createDivision,
  deleteDivision,
} = require('../controllers/divisionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDivisions)
  .post(protect, adminOnly, createDivision);

router.route('/:id')
  .delete(protect, adminOnly, deleteDivision);

module.exports = router;
