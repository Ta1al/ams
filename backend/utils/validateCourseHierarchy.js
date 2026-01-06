const Department = require('../models/Department');
const Division = require('../models/Division');
const Program = require('../models/Program');
const User = require('../models/User');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const validateCourseHierarchy = async ({
  department,
  division,
  program,
  teacher,
}) => {
  const errors = [];

  for (const [key, value] of Object.entries({ department, division, program, teacher })) {
    if (!value || !isValidObjectId(String(value))) {
      errors.push(`${key} is invalid`);
    }
  }

  if (errors.length) {
    return { ok: false, status: 400, message: errors.join(', ') };
  }

  const [departmentDoc, divisionDoc, programDoc, teacherDoc] = await Promise.all([
    Department.findById(department),
    Division.findById(division),
    Program.findById(program),
    User.findById(teacher).select('role department'),
  ]);

  if (!departmentDoc) return { ok: false, status: 400, message: 'Department not found' };
  if (!divisionDoc) return { ok: false, status: 400, message: 'Division not found' };
  if (!programDoc) return { ok: false, status: 400, message: 'Program not found' };
  if (!teacherDoc) return { ok: false, status: 400, message: 'Teacher user not found' };

  if (teacherDoc.role !== 'teacher') {
    return { ok: false, status: 400, message: 'Assigned teacher must have role teacher' };
  }

  // Division belongs to Department
  if (String(divisionDoc.department) !== String(departmentDoc._id)) {
    return { ok: false, status: 400, message: 'Division does not belong to the selected department' };
  }

  // Program belongs to Division
  if (String(programDoc.division) !== String(divisionDoc._id)) {
    return { ok: false, status: 400, message: 'Program does not belong to the selected division' };
  }

  // Optional rule: teacher department matches chosen department (only if teacher has department set)
  if (teacherDoc.department && String(teacherDoc.department) !== String(departmentDoc._id)) {
    return { ok: false, status: 400, message: 'Teacher does not belong to the selected department' };
  }

  return { ok: true };
};

module.exports = { validateCourseHierarchy };
