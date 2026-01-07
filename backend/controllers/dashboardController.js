const User = require('../models/User');

// @desc    Get dashboard stats based on user role
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;
    let stats = {};

    if (role === 'admin') {
      // Admin sees overall system stats
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const totalAdmins = await User.countDocuments({ role: 'admin' });

      stats = {
        totalStudents,
        totalTeachers,
        totalAdmins,
        totalUsers: totalStudents + totalTeachers + totalAdmins,
      };
    } else if (role === 'teacher') {
      // Teacher sees their class stats
      stats = {
        assignedClasses: 0, // TODO: Implement when Class model exists
        totalStudents: 0,
        todayAttendance: null,
      };
    } else if (role === 'student') {
      // Student sees their attendance stats
      stats = {
        attendancePercentage: 0, // TODO: Implement when Attendance model exists
        totalClasses: 0,
        attendedClasses: 0,
      };
    }

    res.json({
      role,
      user: {
        name: req.user.name,
        username: req.user.username,
      },
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
