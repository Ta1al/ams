import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CalendarCheck, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

const TeacherClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchClasses = useCallback(async () => {
    try {
      const query = user?.department ? `?department=${user.department}` : '';
      const response = await fetch(`${apiUrl}/api/classes${query}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.token, user?.department]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

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
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-base-content/60 mt-1">Pick a class to mark attendance</p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No classes found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((c) => (
                  <div key={c._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-base-200">
                    <div>
                      <p className="font-semibold">
                        {c.program?.name} ({c.program?.level})
                      </p>
                      <p className="text-sm text-base-content/60">
                        {c.sessionLabel || `${c.session?.startYear}-${c.session?.endYear}`} · {c.section}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {c.department?.name} / {c.discipline?.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/teacher/attendance', { state: { classId: c._id } })}
                      >
                        <CalendarCheck className="w-4 h-4" />
                        Mark Attendance
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate('/teacher/attendance', { state: { classId: c._id } })}
                      >
                        <Users className="w-4 h-4" />
                        View Students
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

export default TeacherClassesPage;
