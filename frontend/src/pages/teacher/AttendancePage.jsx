import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, Users, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const AttendancePage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const studentUsers = Array.isArray(data) 
          ? data.filter((u) => u.role === 'student')
          : [];
        setStudents(studentUsers);
        // Initialize attendance state
        const initialAttendance = {};
        studentUsers.forEach((s) => {
          initialAttendance[s._id] = null; // null = not marked, true = present, false = absent
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.token, apiUrl]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const markAttendance = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAllPresent = () => {
    const newAttendance = {};
    students.forEach((s) => {
      newAttendance[s._id] = true;
    });
    setAttendance(newAttendance);
    setSaved(false);
  };

  const saveAttendance = async () => {
    setSaving(true);
    // Simulate saving - in real app, send to backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    // Show success message
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter((v) => v === true).length;
    const absent = Object.values(attendance).filter((v) => v === false).length;
    const unmarked = Object.values(attendance).filter((v) => v === null).length;
    return { present, absent, unmarked };
  };

  const stats = getAttendanceStats();

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <p className="text-base-content/60 mt-1">{today}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={markAllPresent} className="btn btn-ghost">
              Mark All Present
            </button>
            <button 
              onClick={saveAttendance} 
              className={`btn btn-primary ${saving ? 'loading' : ''}`}
              disabled={saving || stats.unmarked === students.length}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat bg-success/10 rounded-xl">
            <div className="stat-title">Present</div>
            <div className="stat-value text-success">{stats.present}</div>
          </div>
          <div className="stat bg-error/10 rounded-xl">
            <div className="stat-title">Absent</div>
            <div className="stat-value text-error">{stats.absent}</div>
          </div>
          <div className="stat bg-base-200 rounded-xl">
            <div className="stat-title">Unmarked</div>
            <div className="stat-value">{stats.unmarked}</div>
          </div>
        </div>

        {/* Students List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No students found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((s) => (
                  <div 
                    key={s._id} 
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      attendance[s._id] === true 
                        ? 'bg-success/5 border-success/20' 
                        : attendance[s._id] === false 
                        ? 'bg-error/5 border-error/20' 
                        : 'bg-base-200 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                          <span>{s.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-base-content/60">{s.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAttendance(s._id, true)}
                        className={`btn btn-sm ${
                          attendance[s._id] === true ? 'btn-success' : 'btn-ghost'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(s._id, false)}
                        className={`btn btn-sm ${
                          attendance[s._id] === false ? 'btn-error' : 'btn-ghost'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
