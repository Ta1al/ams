const express = require('express');
const router = express.Router();
const {
  getDisciplines,
  createDiscipline,
  deleteDiscipline,
} = require('../controllers/disciplineController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDisciplines)
  .post(protect, adminOnly, createDiscipline);

router.route('/:id')
  .delete(protect, adminOnly, deleteDiscipline);

module.exports = router;
