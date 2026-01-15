/*
Smoke test: attendance is blocked outside class time.

Flow:
- Login as teacher1
- Find PF101 offering for teacher1
- Create a session that ended in the past
- Try to mark attendance using "now" timestamp -> should fail (403)
- Create an active session for now
- Try to mark attendance -> should succeed

Env (PowerShell):
$env:BASE_URL='http://localhost:5000'
node .\scripts\smoke-attendance-window.js
*/

const { request } = require('./httpClient');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const main = async () => {
  const teacherLogin = await request({
    baseUrl: BASE_URL,
    path: '/api/auth/login',
    method: 'POST',
    json: { username: 'teacher1', password: 'teacher123' },
  });

  const token = teacherLogin?.token;
  if (!token) throw new Error('Teacher login failed. Did you seed?');

  const courses = await request({ baseUrl: BASE_URL, path: '/api/courses', token });
  const course = courses.find((c) => c.code === 'PF101') || courses[0];
  if (!course) throw new Error('No course found');

  const courseId = course._id;

  const pastStart = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const pastEnd = new Date(Date.now() - 2 * 60 * 60 * 1000);

  await request({
    baseUrl: BASE_URL,
    path: '/api/sessions',
    method: 'POST',
    token,
    json: { course: courseId, startTime: pastStart.toISOString(), endTime: pastEnd.toISOString() },
  });

  // Mark attendance now -> should fail
  let blockedOk = false;
  try {
    await request({
      baseUrl: BASE_URL,
      path: '/api/attendance',
      method: 'POST',
      token,
      json: {
        course: courseId,
        date: new Date().toISOString(),
        studentRecords: [],
      },
    });
  } catch (err) {
    if (err.status === 400) {
      // expected next validation error because empty studentRecords;
      // we need a real student record to test window gating.
    }
  }

  // Fetch students so we can submit a valid record
  const students = await request({ baseUrl: BASE_URL, path: `/api/courses/${courseId}/students`, token });
  if (!students.length) throw new Error('No enrolled students; seed should enroll students in PF101 Regular');

  try {
    await request({
      baseUrl: BASE_URL,
      path: '/api/attendance',
      method: 'POST',
      token,
      json: {
        course: courseId,
        date: new Date().toISOString(),
        studentRecords: [{ student: students[0]._id, status: 'present' }],
      },
    });
  } catch (err) {
    if (err.status === 403) blockedOk = true;
    else throw err;
  }

  if (!blockedOk) {
    throw new Error('Expected attendance to be blocked outside session window (403)');
  }

  // Create active session now and retry (should succeed)
  const start = new Date(Date.now() - 5 * 60 * 1000);
  const end = new Date(Date.now() + 55 * 60 * 1000);

  await request({
    baseUrl: BASE_URL,
    path: '/api/sessions',
    method: 'POST',
    token,
    json: { course: courseId, startTime: start.toISOString(), endTime: end.toISOString() },
  });

  const attendance = await request({
    baseUrl: BASE_URL,
    path: '/api/attendance',
    method: 'POST',
    token,
    json: {
      course: courseId,
      date: new Date().toISOString(),
      studentRecords: [{ student: students[0]._id, status: 'present' }],
      notes: 'smoke test',
    },
  });

  if (!attendance?._id) throw new Error('Attendance create did not return _id');

  console.log('OK: attendance is blocked outside time, allowed during session');
};

main().catch((err) => {
  console.error('Smoke failed:', err.message);
  if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
  process.exit(1);
});
