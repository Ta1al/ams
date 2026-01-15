/*
Smoke test: bulk enroll a whole class (batch) into a course.

Env (PowerShell):
$env:BASE_URL='http://localhost:5000'
$env:ADMIN_USERNAME='admin'
$env:ADMIN_PASSWORD='admin123'

Selectors (optional):
$env:CLASS_ID='<mongodb id>'       # if omitted uses course.class
$env:COURSE_CODE='CS101'           # if omitted, picks first course
*/

const { request } = require('./httpClient');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const CLASS_ID = process.env.CLASS_ID;
const COURSE_CODE = process.env.COURSE_CODE;

const main = async () => {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required');
  }

  const login = await request({
    baseUrl: BASE_URL,
    path: '/api/auth/login',
    method: 'POST',
    json: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
  });

  const token = login.token || login?.data?.token;
  if (!token) throw new Error('Login did not return token');

  const courses = await request({ baseUrl: BASE_URL, path: '/api/courses', token });
  const course = COURSE_CODE ? courses.find((c) => c.code === COURSE_CODE) : courses[0];
  if (!course) throw new Error('No course found');

  const courseId = course._id;
  const courseClassId = course.class?._id || course.class;
  const classId = CLASS_ID || courseClassId;

  if (!classId) {
    throw new Error('Course has no class; create/update course with class first');
  }

  console.log('Using course:', { id: courseId, code: course.code, classId });

  const enroll = await request({
    baseUrl: BASE_URL,
    path: `/api/courses/${courseId}/enroll-class`,
    method: 'POST',
    token,
    json: { classId },
  });

  console.log('Enroll response:', enroll.message || enroll);

  const students = await request({
    baseUrl: BASE_URL,
    path: `/api/classes/${classId}/students`,
    token,
  });

  const enrolled = await request({
    baseUrl: BASE_URL,
    path: `/api/courses/${courseId}/students`,
    token,
  });

  const enrolledSet = new Set(enrolled.map((s) => String(s._id)));
  const missing = students.filter((s) => !enrolledSet.has(String(s._id)));

  if (missing.length) {
    throw new Error(`Some class students are not enrolled: ${missing.slice(0, 5).map((s) => s.username).join(', ')}`);
  }

  console.log(`OK: all ${students.length} class students are enrolled in course`);
};

main().catch((err) => {
  console.error('Smoke test failed:', err.message);
  if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
  process.exitCode = 1;
});
