const Department = require('../models/Department');
const Program = require('../models/Program');
const Discipline = require('../models/Discipline');
const User = require('../models/User');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const validateCourseHierarchy = async ({
  department,
  program,
  discipline,
  teacher,
}) => {
  const errors = [];

  for (const [key, value] of Object.entries({ department, program, discipline, teacher })) {
    if (!value || !isValidObjectId(String(value))) {
      errors.push(`${key} is invalid`);
    }
  }

  if (errors.length) {
    return { ok: false, status: 400, message: errors.join(', ') };
  }

  const [departmentDoc, programDoc, disciplineDoc, teacherDoc] = await Promise.all([
    Department.findById(department),
    Program.findById(program),
    Discipline.findById(discipline),
    User.findById(teacher).select('role department'),
  ]);

  if (!departmentDoc) return { ok: false, status: 400, message: 'Department not found' };
  if (!programDoc) return { ok: false, status: 400, message: 'Program not found' };
  if (!disciplineDoc) return { ok: false, status: 400, message: 'Discipline not found' };
  if (!teacherDoc) return { ok: false, status: 400, message: 'Teacher user not found' };

  if (teacherDoc.role !== 'teacher') {
    return { ok: false, status: 400, message: 'Assigned teacher must have role teacher' };
  }

  // Program belongs to Department
  if (String(programDoc.department) !== String(departmentDoc._id)) {
    return { ok: false, status: 400, message: 'Program does not belong to the selected department' };
  }

  // Discipline belongs to Program
  if (String(disciplineDoc.program) !== String(programDoc._id)) {
    return { ok: false, status: 400, message: 'Discipline does not belong to the selected program' };
  }

  // Optional rule: teacher department matches chosen department (only if teacher has department set)
  if (teacherDoc.department && String(teacherDoc.department) !== String(departmentDoc._id)) {
    return { ok: false, status: 400, message: 'Teacher does not belong to the selected department' };
  }

  return { ok: true };
};

module.exports = { validateCourseHierarchy };
