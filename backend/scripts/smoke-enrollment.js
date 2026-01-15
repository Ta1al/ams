/*
Smoke test: login as admin, pick a student + course, enroll, verify.

Prereqs:
- Backend running
- Admin user exists (seeded)

Env (PowerShell):
$env:BASE_URL='http://localhost:5000'
$env:ADMIN_USERNAME='admin'
$env:ADMIN_PASSWORD='admin123'

Optional:
$env:STUDENT_USERNAME='student1'   # if omitted, picks first student
$env:COURSE_CODE='CS101'           # if omitted, picks first course
*/

const { request } = require('./httpClient');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const STUDENT_USERNAME = process.env.STUDENT_USERNAME;
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
  if (!token) {
    throw new Error('Login did not return token');
  }

  const users = await request({
    baseUrl: BASE_URL,
    path: '/api/users?role=student',
    token,
  });

  const student = STUDENT_USERNAME
    ? users.find((u) => u.username === STUDENT_USERNAME)
    : users[0];

  if (!student) {
    throw new Error('No student found; create one as admin first');
  }

  const courses = await request({
    baseUrl: BASE_URL,
    path: '/api/courses',
    token,
  });

  const course = COURSE_CODE
    ? courses.find((c) => c.code === COURSE_CODE)
    : courses[0];

  if (!course) {
    throw new Error('No course found; create one as admin first');
  }

  console.log('Using student:', { id: student._id, username: student.username, program: student.program?._id || student.program });
  console.log('Using course:', { id: course._id, code: course.code, program: course.program?._id || course.program });

  const enroll = await request({
    baseUrl: BASE_URL,
    path: `/api/courses/${course._id}/enroll`,
    method: 'POST',
    token,
    json: { studentIds: [student._id] },
  });

  console.log('Enroll response:', enroll.message || enroll);

  const enrolled = await request({
    baseUrl: BASE_URL,
    path: `/api/courses/${course._id}/students`,
    token,
  });

  const isEnrolled = Array.isArray(enrolled)
    ? enrolled.some((s) => String(s._id) === String(student._id))
    : false;

  if (!isEnrolled) {
    throw new Error('Enrollment did not persist: student not in course students list');
  }

  const studentCourses = await request({
    baseUrl: BASE_URL,
    path: `/api/courses/student/${student._id}`,
    token,
  });

  const found = Array.isArray(studentCourses)
    ? studentCourses.some((c) => String(c._id) === String(course._id))
    : false;

  if (!found) {
    throw new Error('Enrollment did not reflect in student course list');
  }

  console.log('OK: enrollment verified via /students and /student/:id');
};

main().catch((err) => {
  console.error('Smoke test failed:', err.message);
  if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
  process.exitCode = 1;
});
