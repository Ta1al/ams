const ClassSession = require('../models/ClassSession');
const Course = require('../models/Course');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const ensureCourseAccess = async (courseId, user) => {
  const course = await Course.findById(courseId).select('teacher');
  if (!course) return { ok: false, status: 404, message: 'Course not found' };

  if (user.role === 'admin') return { ok: true, course };
  if (user.role === 'teacher' && String(course.teacher) === String(user._id)) {
    return { ok: true, course };
  }

  return { ok: false, status: 403, message: 'Not authorized for this course' };
};

const parseDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const addWeeks = (date, weeks) => addDays(date, weeks * 7);

const normalizeRoom = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

// GET /api/sessions?course=<id>&status=scheduled|active|completed|cancelled
const getSessions = async (req, res) => {
  try {
    const filter = {};

    if (req.query.course) {
      if (!isValidObjectId(req.query.course)) {
        return res.status(400).json({ message: 'Invalid course id' });
      }

      const access = await ensureCourseAccess(req.query.course, req.user);
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      filter.course = req.query.course;
    } else {
      // Teachers must scope to their courses; admins can list all (small system)
      if (req.user.role === 'teacher') {
        return res.status(400).json({ message: 'course query is required for teachers' });
      }
    }

    if (req.query.status) filter.status = req.query.status;

    const sessions = await ClassSession.find(filter)
      .populate({ path: 'course', select: 'name code class teacher', populate: { path: 'class', select: 'section session' } })
      .sort({ startTime: 1 });

    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/sessions
// body: { course, startTime, endTime, room? }
const createSession = async (req, res) => {
  try {
    const { course, startTime, endTime, room } = req.body;

    if (!course || !startTime || !endTime) {
      return res.status(400).json({ message: 'course, startTime, endTime are required' });
    }

    if (!isValidObjectId(course)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const access = await ensureCourseAccess(course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const start = parseDate(startTime);
    const end = parseDate(endTime);
    if (!start || !end) {
      return res.status(400).json({ message: 'startTime/endTime must be valid dates' });
    }
    if (end <= start) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }

    const created = await ClassSession.create({
      course,
      room: normalizeRoom(room),
      startTime: start,
      endTime: end,
      status: 'scheduled',
      createdBy: req.user._id,
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/sessions/recurring
// body: { course, startTime, endTime, room?, frequency: 'daily'|'weekly', interval?, count?, until? }
const createRecurringSessions = async (req, res) => {
  try {
    const {
      course,
      startTime,
      endTime,
      room,
      frequency,
      interval,
      count,
      until,
    } = req.body;

    if (!course || !startTime || !endTime || !frequency) {
      return res.status(400).json({ message: 'course, startTime, endTime, frequency are required' });
    }

    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'frequency must be daily or weekly' });
    }

    if (!isValidObjectId(course)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const access = await ensureCourseAccess(course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const start0 = parseDate(startTime);
    const end0 = parseDate(endTime);
    if (!start0 || !end0) {
      return res.status(400).json({ message: 'startTime/endTime must be valid dates' });
    }
    if (end0 <= start0) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }

    const normalizedInterval = Number.isInteger(Number(interval)) ? Math.max(1, Number(interval)) : 1;
    const normalizedCount = Number.isInteger(Number(count)) ? Math.max(1, Number(count)) : 1;
    const untilDate = until ? parseDate(until) : null;

    const sessions = [];
    let start = start0;
    let end = end0;

    for (let i = 0; i < normalizedCount; i += 1) {
      if (untilDate && start > untilDate) break;

      sessions.push({
        course,
        room: normalizeRoom(room),
        startTime: start,
        endTime: end,
        status: 'scheduled',
        recurrence: {
          frequency,
          interval: normalizedInterval,
          count: normalizedCount,
          until: untilDate || undefined,
        },
        createdBy: req.user._id,
      });

      if (frequency === 'daily') {
        start = addDays(start, normalizedInterval);
        end = addDays(end, normalizedInterval);
      } else {
        start = addWeeks(start, normalizedInterval);
        end = addWeeks(end, normalizedInterval);
      }
    }

    const created = await ClassSession.insertMany(sessions);
    return res.status(201).json({ count: created.length, sessions: created });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/sessions/:id/reschedule
// body: { startTime, endTime, reason, room? }
const rescheduleSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, reason, room } = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid session id' });

    const session = await ClassSession.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const access = await ensureCourseAccess(session.course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const start = parseDate(startTime);
    const end = parseDate(endTime);
    if (!start || !end) {
      return res.status(400).json({ message: 'startTime/endTime must be valid dates' });
    }
    if (end <= start) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }

    // Keep status sane
    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot reschedule a ${session.status} session` });
    }

    session.startTime = start;
    session.endTime = end;
    session.rescheduleReason = typeof reason === 'string' ? reason : '';
    if (room !== undefined) session.room = normalizeRoom(room);
    session.updatedBy = req.user._id;

    await session.save();
    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/sessions/:id/status
// body: { status }
const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid session id' });

    const session = await ClassSession.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const access = await ensureCourseAccess(session.course, req.user);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    if (!['scheduled', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    session.status = status;
    session.updatedBy = req.user._id;

    if (status === 'cancelled' && req.body.cancelledReason !== undefined) {
      session.cancelledReason = String(req.body.cancelledReason || '');
    }

    await session.save();
    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSessions,
  createSession,
  createRecurringSessions,
  rescheduleSession,
  updateSessionStatus,
};
