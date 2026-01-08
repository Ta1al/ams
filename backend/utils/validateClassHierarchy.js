const Department = require('../models/Department');
const Division = require('../models/Division');
const Program = require('../models/Program');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const validateClassHierarchy = async ({ department, division, program }) => {
  const errors = [];

  for (const [key, value] of Object.entries({ department, division, program })) {
    if (!value || !isValidObjectId(String(value))) {
      errors.push(`${key} is invalid`);
    }
  }

  if (errors.length) {
    return { ok: false, status: 400, message: errors.join(', ') };
  }

  const [departmentDoc, divisionDoc, programDoc] = await Promise.all([
    Department.findById(department),
    Division.findById(division),
    Program.findById(program),
  ]);

  if (!departmentDoc) return { ok: false, status: 400, message: 'Department not found' };
  if (!divisionDoc) return { ok: false, status: 400, message: 'Division not found' };
  if (!programDoc) return { ok: false, status: 400, message: 'Program not found' };

  if (String(divisionDoc.department) !== String(departmentDoc._id)) {
    return { ok: false, status: 400, message: 'Division does not belong to the selected department' };
  }

  if (String(programDoc.division) !== String(divisionDoc._id)) {
    return { ok: false, status: 400, message: 'Program does not belong to the selected division' };
  }

  return { ok: true };
};

module.exports = { validateClassHierarchy };
