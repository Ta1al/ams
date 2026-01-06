import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, TrendingUp, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const MyAttendancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [attendanceData, setAttendanceData] = useState({
    percentage: 85,
    totalClasses: 50,
    attended: 42,
    absent: 8,
    recentAttendance: [
      { date: '2026-01-06', status: 'present', subject: 'Data Structures' },
      { date: '2026-01-05', status: 'present', subject: 'Algorithms' },
      { date: '2026-01-04', status: 'absent', subject: 'Database Systems' },
      { date: '2026-01-03', status: 'present', subject: 'Web Development' },
      { date: '2026-01-02', status: 'present', subject: 'Data Structures' },
    ],
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="text-base-content/60 mt-1">
            Track your attendance record, {user?.name}
          </p>
        </div>

        {/* Attendance Overview */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Attendance Overview</h2>
            <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
              <div 
                className="radial-progress text-primary" 
                style={{ "--value": attendanceData.percentage, "--size": "10rem", "--thickness": "1rem" }}
                role="progressbar"
              >
                <span className="text-2xl font-bold">{attendanceData.percentage}%</span>
              </div>
              
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-xl">
                  <div className="stat-figure text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-sm">Total</div>
                  <div className="stat-value text-2xl">{attendanceData.totalClasses}</div>
                </div>
                <div className="stat bg-success/10 rounded-xl">
                  <div className="stat-figure text-success">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-sm">Present</div>
                  <div className="stat-value text-2xl text-success">{attendanceData.attended}</div>
                </div>
                <div className="stat bg-error/10 rounded-xl">
                  <div className="stat-figure text-error">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-sm">Absent</div>
                  <div className="stat-value text-2xl text-error">{attendanceData.absent}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Attendance</h2>
            <div className="overflow-x-auto mt-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.recentAttendance.map((record, idx) => (
                    <tr key={idx} className="hover">
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.subject}</td>
                      <td>
                        <span className={`badge ${
                          record.status === 'present' ? 'badge-success' : 'badge-error'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyAttendancePage;
