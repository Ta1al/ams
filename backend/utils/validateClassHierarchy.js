const Department = require('../models/Department');
const Program = require('../models/Program');
const Discipline = require('../models/Discipline');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const validateClassHierarchy = async ({ department, program, discipline }) => {
  const errors = [];

  for (const [key, value] of Object.entries({ department, program, discipline })) {
    if (!value || !isValidObjectId(String(value))) {
      errors.push(`${key} is invalid`);
    }
  }

  if (errors.length) {
    return { ok: false, status: 400, message: errors.join(', ') };
  }

  const [departmentDoc, programDoc, disciplineDoc] = await Promise.all([
    Department.findById(department),
    Program.findById(program),
    Discipline.findById(discipline),
  ]);

  if (!departmentDoc) return { ok: false, status: 400, message: 'Department not found' };
  if (!programDoc) return { ok: false, status: 400, message: 'Program not found' };
  if (!disciplineDoc) return { ok: false, status: 400, message: 'Discipline not found' };

  if (String(programDoc.department) !== String(departmentDoc._id)) {
    return { ok: false, status: 400, message: 'Program does not belong to the selected department' };
  }

  if (String(disciplineDoc.program) !== String(programDoc._id)) {
    return { ok: false, status: 400, message: 'Discipline does not belong to the selected program' };
  }

  return { ok: true };
};

module.exports = { validateClassHierarchy };
