import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Users, GraduationCap, UserCog, TrendingUp } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const AdminDashboard = () => {
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

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'bg-primary',
      textColor: 'text-primary',
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: Users,
      color: 'bg-secondary',
      textColor: 'text-secondary',
    },
    {
      title: 'Total Admins',
      value: stats?.totalAdmins || 0,
      icon: UserCog,
      color: 'bg-accent',
      textColor: 'text-accent',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: TrendingUp,
      color: 'bg-info',
      textColor: 'text-info',
    },
  ];

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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-base-content/60 mt-1">
          Welcome back, {user?.name}! Here's an overview of your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.color}/10`}>
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Quick Actions</h2>
          <div className="flex flex-wrap gap-3 mt-4">
            <button className="btn btn-primary">
              <Users className="w-4 h-4" />
              Add User
            </button>
            <button className="btn btn-secondary">
              <GraduationCap className="w-4 h-4" />
              Add Program
            </button>
            <button className="btn btn-accent">
              <UserCog className="w-4 h-4" />
              Manage Roles
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Activity</h2>
          <div className="mt-4">
            <div className="text-center py-8 text-base-content/60">
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
