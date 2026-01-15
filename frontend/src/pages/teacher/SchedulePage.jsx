import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, Clock, Repeat, MapPin, Plus, AlertCircle, RefreshCw } from 'lucide-react';

const toLocalInputValue = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const formatDateTime = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
};

const TeacherSchedulePage = () => {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessions, setSessions] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formMode, setFormMode] = useState('single'); // single | recurring
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState(() => toLocalInputValue(new Date()));
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return toLocalInputValue(d);
  });
  const [frequency, setFrequency] = useState('weekly');
  const [interval, setInterval] = useState(1);
  const [count, setCount] = useState(12);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch(`${apiUrl}/api/courses`, {
        headers: { Authorization: `Bearer ${user?.token}` },
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

  const fetchSessions = useCallback(async (courseId) => {
    if (!courseId) return;
    try {
      setLoadingSessions(true);
      const response = await fetch(`${apiUrl}/api/sessions?course=${courseId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load sessions');
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [apiUrl, user?.token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (!selectedCourseId) return;
    fetchSessions(selectedCourseId);
  }, [selectedCourseId, fetchSessions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError('Select a course first');
      return;
    }

    resetMessages();
    setSaving(true);

    try {
      const payloadBase = {
        course: selectedCourseId,
        room,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      const url = formMode === 'recurring'
        ? `${apiUrl}/api/sessions/recurring`
        : `${apiUrl}/api/sessions`;

      const payload = formMode === 'recurring'
        ? {
            ...payloadBase,
            frequency,
            interval: Number(interval) || 1,
            count: Number(count) || 1,
          }
        : payloadBase;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to create session');

      setSuccess(formMode === 'recurring'
        ? `Created ${data.count || 0} sessions`
        : 'Session created'
      );

      await fetchSessions(selectedCourseId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (sessionId, status) => {
    resetMessages();
    try {
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to update status');
      setSuccess('Session updated');
      setSessions((prev) => prev.map((s) => (s._id === sessionId ? data : s)));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-base-content/60 mt-1">Create single or repeating class sessions</p>
          </div>
          <button
            className={`btn btn-outline ${loadingSessions ? 'loading' : ''}`}
            onClick={() => selectedCourseId && fetchSessions(selectedCourseId)}
            disabled={!selectedCourseId || loadingSessions}
            type="button"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {(error || success) && (
          <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
            <AlertCircle className="w-4 h-4" />
            <span>{error || success}</span>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Course</span></label>
                <select
                  className="select select-bordered"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code || c.name} — {c.class?.section || 'Section'}
                    </option>
                  ))}
                </select>
                {selectedCourse && (
                  <div className="text-xs text-base-content/60 mt-2">
                    {selectedCourse.name} · {selectedCourse.class?.sessionLabel || `${selectedCourse.class?.session?.startYear}-${selectedCourse.class?.session?.endYear}`} · {selectedCourse.class?.section}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Room</span></label>
                <label className="input input-bordered flex items-center gap-2">
                  <MapPin className="w-4 h-4 opacity-60" />
                  <input
                    className="grow"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Lab 2 / Room A-101"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Start</span></label>
                <label className="input input-bordered flex items-center gap-2">
                  <Calendar className="w-4 h-4 opacity-60" />
                  <input
                    type="datetime-local"
                    className="grow"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">End</span></label>
                <label className="input input-bordered flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-60" />
                  <input
                    type="datetime-local"
                    className="grow"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="tabs tabs-boxed">
                <button
                  className={`tab ${formMode === 'single' ? 'tab-active' : ''}`}
                  onClick={() => setFormMode('single')}
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  Single
                </button>
                <button
                  className={`tab ${formMode === 'recurring' ? 'tab-active' : ''}`}
                  onClick={() => setFormMode('recurring')}
                  type="button"
                >
                  <Repeat className="w-4 h-4" />
                  Repeating
                </button>
              </div>

              <button
                className={`btn btn-primary ${saving ? 'loading' : ''}`}
                onClick={handleCreate}
                disabled={saving || !selectedCourseId || loadingCourses}
                type="button"
              >
                {formMode === 'recurring' ? 'Create Series' : 'Create Session'}
              </button>
            </div>

            {formMode === 'recurring' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Frequency</span></label>
                  <select
                    className="select select-bordered"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Interval</span></label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={interval}
                    min={1}
                    onChange={(e) => setInterval(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Count</span></label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={count}
                    min={1}
                    onChange={(e) => setCount(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Upcoming / Scheduled Sessions</h2>
            {loadingSessions ? (
              <div className="flex items-center justify-center h-32">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-base-content/60">No sessions yet.</div>
            ) : (
              <div className="space-y-2">
                {sessions
                  .slice()
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .map((s) => (
                    <div key={s._id} className="p-4 rounded-xl bg-base-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {formatDateTime(s.startTime)} → {formatDateTime(s.endTime)}
                        </div>
                        <div className="text-sm text-base-content/60">
                          Room: {s.room || '—'} · Status: {s.status}
                        </div>
                        {s.recurrence?.frequency && s.recurrence.frequency !== 'none' && (
                          <div className="text-xs text-base-content/60">
                            Repeats: {s.recurrence.frequency} · every {s.recurrence.interval || 1} · count {s.recurrence.count || 1}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatus(s._id, 'active')}
                          type="button"
                        >
                          Start
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatus(s._id, 'completed')}
                          type="button"
                        >
                          Complete
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleStatus(s._id, 'cancelled')}
                          type="button"
                        >
                          Cancel
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

export default TeacherSchedulePage;
