const ClassSession = require('../models/ClassSession');
const Course = require('../models/Course');

const minutesToMs = (minutes) => minutes * 60 * 1000;

// Finds a session where now is within [start - earlyGrace, end + lateGrace]
const findActiveOrGraceSession = async ({ courseId, now = new Date(), earlyGraceMinutes, lateGraceMinutes }) => {
  const early = minutesToMs(earlyGraceMinutes);
  const late = minutesToMs(lateGraceMinutes);

  const from = new Date(now.getTime() - early);
  const to = new Date(now.getTime() + late);

  const session = await ClassSession.findOne({
    course: courseId,
    status: { $in: ['scheduled', 'active'] },
    startTime: { $lte: to },
    endTime: { $gte: from },
  }).sort({ startTime: -1 });

  return session;
};

const ensureAttendanceAllowedNow = async ({ courseId, user, date }) => {
  if (user.role === 'admin') return { ok: true };

  // Teachers must be teacher of course
  const course = await Course.findById(courseId).select('teacher');
  if (!course) return { ok: false, status: 404, message: 'Course not found' };
  if (String(course.teacher) !== String(user._id)) {
    return { ok: false, status: 403, message: 'Not authorized for this course' };
  }

  const EARLY_GRACE_MIN = Number(process.env.ATTENDANCE_EARLY_GRACE_MINUTES || '10');
  const LATE_GRACE_MIN = Number(process.env.ATTENDANCE_LATE_GRACE_MINUTES || '15');

  // Use the provided attendance date as the reference time if it is today-ish,
  // otherwise use server now. Practically, teachers should send current timestamp.
  const now = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();

  const session = await findActiveOrGraceSession({
    courseId,
    now,
    earlyGraceMinutes: EARLY_GRACE_MIN,
    lateGraceMinutes: LATE_GRACE_MIN,
  });

  if (!session) {
    return {
      ok: false,
      status: 403,
      message: 'Attendance can only be marked during scheduled class time',
    };
  }

  return { ok: true, sessionId: session._id };
};

module.exports = { ensureAttendanceAllowedNow };
