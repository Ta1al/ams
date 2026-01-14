import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Users, CalendarCheck, BookOpen, Clock, FileText } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-base-content/60 mt-1">
          Welcome back, {user?.name}! Manage your classes and attendance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm">Assigned Classes</p>
                <p className="text-3xl font-bold mt-1">{stats?.assignedClasses || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm">Total Students</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalStudents || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <Users className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm">Today's Classes</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <Clock className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Today's Schedule
          </h2>
          <div className="mt-4">
            <div className="text-center py-8 text-base-content/60">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No classes scheduled for today</p>
              <p className="text-sm mt-1">Classes will appear here once assigned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Quick Actions</h2>
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={() => navigate('/teacher/attendance')} className="btn btn-primary">
              <CalendarCheck className="w-4 h-4" />
              Mark Attendance
            </button>
            <button onClick={() => navigate('/teacher/assignments')} className="btn btn-accent">
              <FileText className="w-4 h-4" />
              Assignments
            </button>
            <button onClick={() => navigate('/teacher/students')} className="btn btn-secondary">
              <Users className="w-4 h-4" />
              View Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
