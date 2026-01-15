const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const { ensureAttendanceAllowedNow } = require('../utils/attendanceWindow');

const STATUS_ENUM = ['present', 'absent', 'late'];

const ensureCourseAccess = async (courseId, user) => {
  const course = await Course.findById(courseId).select('teacher');
  if (!course) return { allowed: false, status: 404, message: 'Course not found' };

  if (user.role === 'admin') return { allowed: true, course };
  if (user.role === 'teacher' && course.teacher?.toString() === user._id.toString()) {
    return { allowed: true, course };
  }

  return { allowed: false, status: 403, message: 'Not authorized for this course' };
};

const normalizeStudentRecords = (studentRecords = [], bulkStatus) => {
  if (!Array.isArray(studentRecords)) return [];
  return studentRecords.map((rec) => {
    const status = bulkStatus || rec.status;
    return {
      student: rec.student,
      status,
      remarks: rec.remarks,
    };
  }).filter((rec) => rec.student && STATUS_ENUM.includes(rec.status));
};

// POST /api/attendance
const markAttendance = async (req, res) => {
  try {
    const { course, date, session, studentRecords, bulkStatus, notes } = req.body;
    if (!course || !date) {
      return res.status(400).json({ message: 'Course and date are required' });
    }

    const access = await ensureCourseAccess(course, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ message: access.message });
    }

    // Only allow teachers to mark attendance during scheduled class time
    const attendanceDate = new Date(date);
    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const windowCheck = await ensureAttendanceAllowedNow({
      courseId: course,
      user: req.user,
      date: attendanceDate,
    });
    if (!windowCheck.ok) {
      return res.status(windowCheck.status).json({ message: windowCheck.message });
    }

    const existing = await Attendance.findOne({ course, date: attendanceDate });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already exists for this course and date' });
    }

    const records = normalizeStudentRecords(studentRecords, bulkStatus);
    if (!records.length) {
      return res.status(400).json({ message: 'At least one student record is required' });
    }

    const attendance = await Attendance.create({
      course,
      date: attendanceDate,
      session,
      studentRecords: records,
      markedBy: req.user._id,
      notes,
      classSession: windowCheck.sessionId,
    });

    return res.status(201).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/course/:courseId
const getAttendanceForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, startDate, endDate } = req.query;
    const access = await ensureCourseAccess(courseId, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ message: access.message });
    }

    const filter = { course: courseId };
    if (date) {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) filter.date = d;
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate({ path: 'studentRecords.student', select: 'name email role' })
      .populate({ path: 'markedBy', select: 'name email role' });

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/student/:studentId
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user._id.toString();

    const isSelf = userId === studentId.toString();
    const isAdmin = req.user.role === 'admin';
    const isTeacher = req.user.role === 'teacher';

    if (!isSelf && !isAdmin && !isTeacher) {
      return res.status(403).json({ message: 'Not authorized to view this student attendance' });
    }

    const filter = { 'studentRecords.student': studentId };
    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate({ path: 'course', select: 'name code' })
      .populate({ path: 'studentRecords.student', select: 'name email role' })
      .populate({ path: 'markedBy', select: 'name email role' });

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/my-attendance
const getMyAttendance = async (req, res) => {
  req.params.studentId = req.user._id;
  return getStudentAttendance(req, res);
};

// PUT /api/attendance/:id
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, session, studentRecords, bulkStatus, notes } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    const access = await ensureCourseAccess(attendance.course, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ message: access.message });
    }

    if (date) attendance.date = date;
    if (session !== undefined) attendance.session = session;
    if (notes !== undefined) attendance.notes = notes;

    if (studentRecords) {
      const records = normalizeStudentRecords(studentRecords, bulkStatus);
      if (!records.length) {
        return res.status(400).json({ message: 'At least one student record is required' });
      }
      attendance.studentRecords = records;
    }

    await attendance.save();
    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/attendance/:id
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    const access = await ensureCourseAccess(attendance.course, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ message: access.message });
    }

    await attendance.deleteOne();
    return res.status(200).json({ id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/stats/:courseId
const getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const access = await ensureCourseAccess(courseId, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ message: access.message });
    }

    const records = await Attendance.find({ course: courseId });

    const stats = {
      totalSessions: records.length,
      present: 0,
      absent: 0,
      late: 0,
      totalStudentMarks: 0,
    };

    records.forEach((rec) => {
      rec.studentRecords.forEach((sr) => {
        stats.totalStudentMarks += 1;
        if (sr.status === 'present') stats.present += 1;
        if (sr.status === 'absent') stats.absent += 1;
        if (sr.status === 'late') stats.late += 1;
      });
    });

    const attended = stats.present + stats.late; // count late as attended but separate bucket
    const total = stats.present + stats.absent + stats.late;
    stats.percentage = total > 0 ? Math.round((attended / total) * 10000) / 100 : 0;

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/report
const generateReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to generate reports' });
    }

    const { startDate, endDate, courseId, studentId } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (courseId) filter.course = courseId;
    if (studentId) filter['studentRecords.student'] = studentId;

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate({ path: 'course', select: 'name code' })
      .populate({ path: 'studentRecords.student', select: 'name email role' })
      .populate({ path: 'markedBy', select: 'name email role' });

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getAttendanceForCourse,
  getStudentAttendance,
  getMyAttendance,
  updateAttendance,
  deleteAttendance,
  getCourseStats,
  generateReport,
};
