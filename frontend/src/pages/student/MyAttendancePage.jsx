import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const MyAttendancePage = () => {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const headers = {
    Authorization: `Bearer ${user?.token}`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        setLoading(true);
        const [attRes, courseRes] = await Promise.all([
          fetch(`${apiUrl}/api/attendance/my-attendance`, { headers }),
          fetch(`${apiUrl}/api/courses/student/${user?._id}`, { headers }),
        ]);

        const attData = await attRes.json();
        const courseData = await courseRes.json();

        if (!attRes.ok) throw new Error(attData?.message || 'Failed to load attendance');
        if (!courseRes.ok) throw new Error(courseData?.message || 'Failed to load courses');

        setRecords(Array.isArray(attData) ? attData : []);
        setCourses(Array.isArray(courseData) ? courseData : []);
      } catch (err) {
        setError(err.message);
        setRecords([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, headers, user?._id]);

  const normalized = useMemo(() => {
    return records.map((rec) => {
      const entry = rec.studentRecords?.find((sr) => String(sr.student?._id || sr.student) === String(user?._id));
      return {
        id: rec._id,
        date: rec.date,
        courseId: rec.course?._id || rec.course,
        courseName: rec.course?.name || rec.course?.code || 'Course',
        status: entry?.status || 'absent',
      };
    });
  }, [records, user?._id]);

  const filtered = useMemo(() => {
    return normalized.filter((rec) => !selectedCourse || rec.courseId === selectedCourse);
  }, [normalized, selectedCourse]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const present = filtered.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absent = filtered.filter((r) => r.status === 'absent').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  }, [filtered]);

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
          <p className="text-base-content/60 mt-1">Track your attendance record, {user?.name}</p>
        </div>

        {error ? (
          <div className="alert alert-error flex gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="form-control w-full md:w-72">
                <label className="label"><span className="label-text">Filter by course</span></label>
                <select
                  className="select select-bordered"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">All courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="card-title">Attendance Overview</h2>
            <div className="flex flex-col md:flex-row items-center gap-6 mt-2">
              <div
                className="radial-progress text-primary"
                style={{ '--value': stats.percentage, '--size': '10rem', '--thickness': '1rem' }}
                role="progressbar"
              >
                <span className="text-2xl font-bold">{stats.percentage}%</span>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-xl">
                  <div className="stat-figure text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-sm">Total</div>
                  <div className="stat-value text-2xl">{stats.total}</div>
                </div>
                <div className="stat bg-success/10 rounded-xl">
                  <div className="stat-figure text-success">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-sm">Present/Late</div>
                  <div className="stat-value text-2xl text-success">{stats.present}</div>
                </div>
                <div className="stat bg-error/10 rounded-xl">
                  <div className="stat-figure text-error">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-sm">Absent</div>
                  <div className="stat-value text-2xl text-error">{stats.absent}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Attendance</h2>
            {filtered.length === 0 ? (
              <p className="text-base-content/60 mt-2">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record) => (
                      <tr key={record.id} className="hover">
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.courseName}</td>
                        <td>
                          <span
                            className={`badge ${
                              record.status === 'present'
                                ? 'badge-success'
                                : record.status === 'late'
                                ? 'badge-warning'
                                : 'badge-error'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyAttendancePage;
