import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Users,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const fallbackCourse = {
  name: 'Course Name TBD',
  code: 'COURSE-000',
  program: { program: 'N/A', discipline: { name: 'Discipline TBD' } },
  department: { name: 'Department TBD' },
  discipline: { name: 'Discipline TBD' },
  teacher: { name: 'Instructor TBD' },
};

const placeholderRoster = [
  { id: 's-1', name: 'Alice Johnson', username: 'alice.j', status: 'Present' },
  { id: 's-2', name: 'Brian Smith', username: 'bsmith', status: 'Absent' },
  { id: 's-3', name: 'Chloe Kim', username: 'ckim', status: 'Present' },
  { id: 's-4', name: 'David Lee', username: 'dlee', status: 'Late' },
];

const placeholderTimeline = [
  { id: 't-1', label: 'Mon, Jan 5', status: 'Completed', attendance: '28 / 30' },
  { id: 't-2', label: 'Wed, Jan 7', status: 'Completed', attendance: '29 / 30' },
  { id: 't-3', label: 'Fri, Jan 9', status: 'Scheduled', attendance: '—' },
];

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiUrl}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Unable to load course');
        }

        setCourse(data);
      } catch (err) {
        setError(err.message);
        setCourse((prev) => prev || fallbackCourse);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [apiUrl, courseId, user?.token]);

  const stats = useMemo(() => {
    return {
      attendanceRate: 86,
      totalSessions: 24,
      totalStudents: placeholderRoster.length,
      lastSession: 'Updated 2 days ago',
    };
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

  const displayCourse = course || fallbackCourse;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{displayCourse.name}</h1>
                {displayCourse.code ? (
                  <span className="badge badge-primary badge-lg">{displayCourse.code}</span>
                ) : null}
              </div>
              <p className="text-base-content/60 mt-1">
                Managed by {displayCourse.teacher?.name || 'Instructor'} · {displayCourse.program?.discipline?.name || 'Discipline TBD'} ({displayCourse.program?.program || 'N/A'})
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/teacher/attendance', { state: { courseId } })}
            >
              <CalendarCheck className="w-4 h-4" />
              Mark Attendance
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/teacher/students')}>
              <Users className="w-4 h-4" />
              View Students
            </button>
          </div>
        </div>

        {error ? (
          <div className="alert alert-warning flex items-start gap-2">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Showing placeholder data</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Attendance Rate</p>
              <p className="text-3xl font-bold">{stats.attendanceRate}%</p>
              <div className="badge badge-success">On Track</div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Sessions Held</p>
              <p className="text-3xl font-bold">{stats.totalSessions}</p>
              <p className="text-xs text-base-content/60">Includes past and scheduled</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Students Enrolled</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
              <p className="text-xs text-base-content/60">Roster synced from program</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Last Session</p>
              <p className="text-lg font-semibold">{stats.lastSession}</p>
              <p className="text-xs text-base-content/60">Auto-updates after submission</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow-xl lg:col-span-2">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-base-200">
                  <p className="text-sm text-base-content/60">Program</p>
                  <p className="font-semibold">{displayCourse.program?.discipline?.name || '—'}</p>
                  <p className="text-xs text-base-content/60">Program: {displayCourse.program?.program || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-base-200">
                  <p className="text-sm text-base-content/60">Department</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {displayCourse.department?.name}
                  </p>
                  <p className="text-xs text-base-content/60">Discipline: {displayCourse.discipline?.name || displayCourse.program?.discipline?.name || '—'}</p>
                </div>
                <div className="p-4 rounded-xl bg-base-200">
                  <p className="text-sm text-base-content/60">Instructor</p>
                  <p className="font-semibold flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {displayCourse.teacher?.name}
                  </p>
                  <p className="text-xs text-base-content/60 capitalize">{role} access</p>
                </div>
                <div className="p-4 rounded-xl bg-base-200">
                  <p className="text-sm text-base-content/60">Course ID</p>
                  <p className="font-mono text-sm">{courseId}</p>
                  <p className="text-xs text-base-content/60">Use this when linking attendance</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Next Steps
              </h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-1" />
                  <div>
                    <p className="font-semibold">Connect attendance API</p>
                    <p className="text-sm text-base-content/60">Hook this page to /api/attendance to show live data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-1" />
                  <div>
                    <p className="font-semibold">Sync roster</p>
                    <p className="text-sm text-base-content/60">Pull enrolled students by program/course assignment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-1" />
                  <div>
                    <p className="font-semibold">Session schedule</p>
                    <p className="text-sm text-base-content/60">Surface upcoming classes with room/time once available.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                Attendance Timeline
              </h2>
              <div className="divider my-2"></div>
              <div className="space-y-3">
                {placeholderTimeline.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-base-200">
                    <div>
                      <p className="font-semibold">{entry.label}</p>
                      <p className="text-sm text-base-content/60">Status: {entry.status}</p>
                    </div>
                    <span className="badge badge-outline">{entry.attendance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Roster (sample)
              </h2>
              <div className="divider my-2"></div>
              <div className="space-y-3">
                {placeholderRoster.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-base-200">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span>{student.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-base-content/60">{student.username}</p>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        student.status === 'Present'
                          ? 'badge-success'
                          : student.status === 'Absent'
                          ? 'badge-error'
                          : 'badge-warning'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              What is pending?
            </h2>
            <p className="text-sm text-base-content/70">
              This page is wired for structure. Hook attendance, roster, and scheduling APIs to replace placeholders.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-base-200">
                <p className="font-semibold">Attendance feed</p>
                <p className="text-sm text-base-content/60">Consume upcoming Day 3 attendance endpoints.</p>
              </div>
              <div className="p-4 rounded-xl bg-base-200">
                <p className="font-semibold">Roster source</p>
                <p className="text-sm text-base-content/60">Use program/course assignments once available.</p>
              </div>
              <div className="p-4 rounded-xl bg-base-200">
                <p className="font-semibold">Actions</p>
                <p className="text-sm text-base-content/60">Wire Mark Attendance CTA to selected course.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetailPage;
