import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, BookOpen, TrendingUp, Clock } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
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

  const attendancePercentage = stats?.attendancePercentage || 0;

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
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-base-content/60 mt-1">
          Welcome back, {user?.name}! Track your attendance and classes.
        </p>
      </div>

      {/* Attendance Overview */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Attendance Overview</h2>
          <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            {/* Circular Progress */}
            <div className="radial-progress text-primary" style={{ "--value": attendancePercentage, "--size": "10rem", "--thickness": "1rem" }} role="progressbar">
              <span className="text-2xl font-bold">{attendancePercentage}%</span>
            </div>
            
            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-figure text-primary">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="stat-title">Total Classes</div>
                <div className="stat-value text-primary">{stats?.totalClasses || 0}</div>
              </div>
              
              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-figure text-success">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <div className="stat-title">Attended</div>
                <div className="stat-value text-success">{stats?.attendedClasses || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm">This Week</p>
                <p className="text-3xl font-bold mt-1">0/0</p>
                <p className="text-sm text-base-content/60">Classes Attended</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm">Next Class</p>
                <p className="text-xl font-bold mt-1">No upcoming class</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Classes
          </h2>
          <div className="mt-4">
            <div className="text-center py-8 text-base-content/60">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming classes</p>
              <p className="text-sm mt-1">Your schedule will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
