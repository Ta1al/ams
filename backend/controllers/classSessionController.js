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
// body: { course, startTime, endTime }
const createSession = async (req, res) => {
  try {
    const { course, startTime, endTime } = req.body;

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

// PUT /api/sessions/:id/reschedule
// body: { startTime, endTime, reason }
const rescheduleSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, reason } = req.body;

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
  rescheduleSession,
  updateSessionStatus,
};
