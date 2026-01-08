const express = require('express');
const router = express.Router();

const {
  getDisciplines,
  createDiscipline,
  deleteDiscipline,
} = require('../controllers/disciplineController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getDisciplines)
  .post(createDiscipline);

router.route('/:id')
  .delete(deleteDiscipline);

module.exports = router;
