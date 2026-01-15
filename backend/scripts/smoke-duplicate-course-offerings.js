const { request } = require('./httpClient');

/**
 * Smoke test: allow same course code for different class sections + teachers.
 *
 * Prereqs:
 * - backend running
 * - database seeded (admin/teacher1/teacher2 + at least 2 classes under same program)
 */

const pickFirst = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : null);

const main = async () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  const adminLogin = await request({
    baseUrl,
    path: '/api/auth/login',
    method: 'POST',
    json: { username: 'admin', password: 'admin123' },
  });

  const adminToken = adminLogin?.token;
  if (!adminToken) throw new Error('Admin login failed. Did you seed?');

  const [programs, classes, teachers] = await Promise.all([
    request({ baseUrl, path: '/api/programs', token: adminToken }),
    request({ baseUrl, path: '/api/classes', token: adminToken }),
    request({ baseUrl, path: '/api/users?role=teacher', token: adminToken }),
  ]);

  const program = pickFirst(programs);
  const classA = pickFirst(classes);
  const classB = Array.isArray(classes) && classes.length > 1 ? classes[1] : null;

  if (!program || !classA || !classB) {
    throw new Error('Need at least 1 program and 2 classes. Update seed.js accordingly.');
  }

  const teacher1 = Array.isArray(teachers) ? teachers.find((t) => t.username === 'teacher1') : null;
  const teacher2 = Array.isArray(teachers) ? teachers.find((t) => t.username === 'teacher2') : null;

  if (!teacher1 || !teacher2) {
    throw new Error('Need teacher1 and teacher2 in seed. Update seed.js accordingly.');
  }

  // We need a department+discipline IDs. Reuse from program.populate if present,
  // else fetch from the first class.
  const department = classA.department?._id || classA.department || program.department?._id || program.department;
  const discipline = classA.discipline?._id || classA.discipline || program.discipline?._id || program.discipline;

  if (!department || !discipline) {
    throw new Error('Missing department/discipline. Ensure class is populated or seed provides IDs.');
  }

  const code = `PF${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;

  const offering1 = await request({
    baseUrl,
    path: '/api/courses',
    method: 'POST',
    token: adminToken,
    json: {
      name: 'Programming Fundamentals',
      code,
      department,
      discipline,
      program: program._id || program,
      class: classA._id || classA,
      teacher: teacher1._id,
    },
  });

  const offering2 = await request({
    baseUrl,
    path: '/api/courses',
    method: 'POST',
    token: adminToken,
    json: {
      name: 'Programming Fundamentals',
      code,
      department,
      discipline,
      program: program._id || program,
      class: classB._id || classB,
      teacher: teacher2._id,
    },
  });

  if (!offering1?._id || !offering2?._id) {
    throw new Error('Creating offerings failed. See responses above.');
  }

  console.log('OK: Created two offerings with same code');
  console.log('- offering1', { id: offering1._id, class: offering1.class, teacher: offering1.teacher, code: offering1.code });
  console.log('- offering2', { id: offering2._id, class: offering2.class, teacher: offering2.teacher, code: offering2.code });
};

main().catch((err) => {
  console.error('Smoke failed:', err.message);
  process.exit(1);
});
