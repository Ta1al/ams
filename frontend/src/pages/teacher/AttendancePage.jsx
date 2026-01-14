import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, Users, Check, X, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const AttendancePage = () => {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existingAttendanceId, setExistingAttendanceId] = useState('');
  const [pastRecords, setPastRecords] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const fetchCourses = useCallback(async () => {
    try {
      resetMessages();
      setLoadingCourses(true);
      const response = await fetch(`${apiUrl}/api/courses`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [apiUrl, user?.token]);

  const fetchStudents = useCallback(async (courseId) => {
    if (!courseId) return;
    try {
      resetMessages();
      setLoadingStudents(true);
      const response = await fetch(`${apiUrl}/api/courses/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load students');
      const list = Array.isArray(data) ? data : [];
      setStudents(list);

      const initial = {};
      list.forEach((s) => { initial[s._id] = null; });
      setAttendance(initial);
    } catch (err) {
      setError(err.message);
      setStudents([]);
      setAttendance({});
    } finally {
      setLoadingStudents(false);
    }
  }, [apiUrl, user?.token]);

  const fetchAttendance = useCallback(async (courseId) => {
    if (!courseId) return;
    try {
      resetMessages();
      setLoadingAttendance(true);
      const response = await fetch(`${apiUrl}/api/attendance/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load attendance');
      const list = Array.isArray(data) ? data : [];
      setPastRecords(list);

      // If there is a record for selectedDate, prefill
      const existingForDate = list.find((rec) => new Date(rec.date).toISOString().slice(0, 10) === selectedDate);
      if (existingForDate) {
        const mapped = {};
        existingForDate.studentRecords.forEach((sr) => {
          mapped[sr.student?._id || sr.student] = sr.status;
        });
        setAttendance((prev) => ({ ...prev, ...mapped }));
        setExistingAttendanceId(existingForDate._id);
      } else {
        setExistingAttendanceId('');
      }
    } catch (err) {
      setError(err.message);
      setPastRecords([]);
      setExistingAttendanceId('');
    } finally {
      setLoadingAttendance(false);
    }
  }, [apiUrl, user?.token, selectedDate]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (!selectedCourseId) {
      setStudents([]);
      setAttendance({});
      setPastRecords([]);
      setExistingAttendanceId('');
      return;
    }
    fetchStudents(selectedCourseId);
    fetchAttendance(selectedCourseId);
  }, [selectedCourseId, fetchStudents, fetchAttendance]);

  useEffect(() => {
    if (!selectedCourseId) return;
    // when date changes, check if we already have a record for that date
    const existingForDate = pastRecords.find((rec) => new Date(rec.date).toISOString().slice(0, 10) === selectedDate);
    if (existingForDate) {
      const mapped = {};
      existingForDate.studentRecords.forEach((sr) => {
        mapped[sr.student?._id || sr.student] = sr.status;
      });
      setAttendance((prev) => ({ ...prev, ...mapped }));
      setExistingAttendanceId(existingForDate._id);
    } else {
      const reset = {};
      students.forEach((s) => { reset[s._id] = null; });
      setAttendance(reset);
      setExistingAttendanceId('');
    }
  }, [selectedDate, selectedCourseId, pastRecords, students]);

  const markAttendance = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSuccess('');
  };

  const markAllPresent = () => {
    const next = {};
    students.forEach((s) => { next[s._id] = 'present'; });
    setAttendance(next);
    setSuccess('');
  };

  const stats = (() => {
    const values = Object.values(attendance || {});
    const present = values.filter((v) => v === 'present').length;
    const absent = values.filter((v) => v === 'absent').length;
    const late = values.filter((v) => v === 'late').length;
    const unmarked = values.filter((v) => v === null || v === undefined).length;
    return { present, absent, late, unmarked };
  })();

  const saveAttendance = async () => {
    if (!selectedCourseId) {
      setError('Select a course first');
      return;
    }

    const payload = {
      course: selectedCourseId,
      date: selectedDate,
      studentRecords: Object.entries(attendance).map(([student, status]) => ({ student, status })),
    };

    if (!payload.studentRecords.length) {
      setError('No students to mark');
      return;
    }

    const allUnmarked = payload.studentRecords.every((rec) => !rec.status);
    if (allUnmarked) {
      setError('Please mark at least one student');
      return;
    }

    try {
      resetMessages();
      setSaving(true);
      const url = existingAttendanceId
        ? `${apiUrl}/api/attendance/${existingAttendanceId}`
        : `${apiUrl}/api/attendance`;
      const method = existingAttendanceId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to save attendance');
      setSuccess(existingAttendanceId ? 'Attendance updated' : 'Attendance saved');
      setExistingAttendanceId(data?._id || existingAttendanceId);
      await fetchAttendance(selectedCourseId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <p className="text-base-content/60 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={markAllPresent} className="btn btn-ghost" disabled={!selectedCourseId || students.length === 0}>
              Mark All Present
            </button>
            <button
              onClick={saveAttendance}
              className={`btn btn-primary ${saving ? 'loading' : ''}`}
              disabled={saving || !selectedCourseId || students.length === 0}
            >
              {saving ? 'Saving...' : existingAttendanceId ? 'Update Attendance' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="alert alert-error flex gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : null}
        {success ? (
          <div className="alert alert-success">
            <span>{success}</span>
          </div>
        ) : null}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Select Course</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={loadingCourses}
                >
                  <option value="">Choose a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code || 'N/A'}) — {c.program?.discipline?.name || c.discipline?.name}
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Only your courses are shown here.
                  </span>
                </label>
              </div>
              <div className="form-control w-full md:w-56">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat bg-success/10 rounded-xl">
            <div className="stat-title">Present</div>
            <div className="stat-value text-success">{stats.present}</div>
          </div>
          <div className="stat bg-warning/10 rounded-xl">
            <div className="stat-title">Late</div>
            <div className="stat-value text-warning">{stats.late}</div>
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
            {!selectedCourseId ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">Select a course to load students</p>
              </div>
            ) : loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No students enrolled in this course</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((s) => (
                  <div
                    key={s._id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      attendance[s._id] === 'present'
                        ? 'bg-success/5 border-success/20'
                        : attendance[s._id] === 'absent'
                        ? 'bg-error/5 border-error/20'
                        : attendance[s._id] === 'late'
                        ? 'bg-warning/5 border-warning/20'
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
                        onClick={() => markAttendance(s._id, 'present')}
                        className={`btn btn-sm ${attendance[s._id] === 'present' ? 'btn-success' : 'btn-ghost'}`}
                      >
                        <Check className="w-4 h-4" />
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(s._id, 'late')}
                        className={`btn btn-sm ${attendance[s._id] === 'late' ? 'btn-warning' : 'btn-ghost'}`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => markAttendance(s._id, 'absent')}
                        className={`btn btn-sm ${attendance[s._id] === 'absent' ? 'btn-error' : 'btn-ghost'}`}
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

        {/* Past Attendance */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Past Attendance</h2>
            {loadingAttendance ? (
              <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : pastRecords.length === 0 ? (
              <p className="text-base-content/60">No records yet.</p>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Marked By</th>
                      <th>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastRecords.map((rec) => (
                      <tr key={rec._id} className="hover">
                        <td>{new Date(rec.date).toLocaleDateString()}</td>
                        <td>{rec.markedBy?.name || 'N/A'}</td>
                        <td>{rec.studentRecords?.length || 0}</td>
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

export default AttendancePage;
