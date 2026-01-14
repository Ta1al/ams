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
import { CoursesAPI, UsersAPI } from '../utils/api';

const fallbackCourse = {
  name: 'Course Name TBD',
  code: 'COURSE-000',
  program: { program: 'N/A', discipline: { name: 'Discipline TBD' } },
  department: { name: 'Department TBD' },
  discipline: { name: 'Discipline TBD' },
  teacher: { name: 'Instructor TBD' },
};

const placeholderRoster = [];

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
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [enrollmentSaving, setEnrollmentSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManageEnrollment = role === 'admin' || role === 'teacher';

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await CoursesAPI.getById(courseId, user?.token);
        setCourse(data);
      } catch (err) {
        setError(err.message);
        setCourse((prev) => prev || fallbackCourse);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user?.token]);

  useEffect(() => {
    const fetchEnrolled = async () => {
      if (!user?.token || !courseId) return;
      if (!canManageEnrollment) return;

      setStudentsLoading(true);
      setStudentsError('');
      try {
        const students = await CoursesAPI.getEnrolledStudents(courseId, user.token);
        setEnrolledStudents(Array.isArray(students) ? students : []);
      } catch (err) {
        setStudentsError(err.message || 'Unable to load enrolled students');
        setEnrolledStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchEnrolled();
  }, [canManageEnrollment, courseId, user?.token]);

  useEffect(() => {
    const fetchAllStudents = async () => {
      if (!user?.token) return;
      if (!canManageEnrollment) return;

      try {
        const users = await UsersAPI.listStudents(user.token);
        const students = Array.isArray(users) ? users.filter((u) => u.role === 'student') : [];
        setAllStudents(students);
      } catch {
        setAllStudents([]);
      }
    };

    fetchAllStudents();
  }, [canManageEnrollment, user?.token]);

  const stats = useMemo(() => {
    return {
      attendanceRate: 86,
      totalSessions: 24,
      totalStudents: canManageEnrollment ? enrolledStudents.length : placeholderRoster.length,
      lastSession: 'Updated 2 days ago',
    };
  }, [canManageEnrollment, enrolledStudents.length]);

  const courseProgramId = useMemo(() => {
    const program = course?.program;
    if (!program) return null;
    if (typeof program === 'string') return program;
    return program?._id || null;
  }, [course?.program]);

  const handleEnrollSelected = async () => {
    if (!selectedStudentId) return;
    setEnrollmentSaving(true);
    setStudentsError('');
    try {
      await CoursesAPI.enrollStudents(courseId, [selectedStudentId], user?.token);
      const refreshed = await CoursesAPI.getEnrolledStudents(courseId, user?.token);
      setEnrolledStudents(Array.isArray(refreshed) ? refreshed : []);
      setSelectedStudentId('');
    } catch (err) {
      setStudentsError(err.message || 'Failed to enroll student');
    } finally {
      setEnrollmentSaving(false);
    }
  };

  const handleUnenroll = async (studentId) => {
    setEnrollmentSaving(true);
    setStudentsError('');
    try {
      await CoursesAPI.unenrollStudent(courseId, studentId, user?.token);
      setEnrolledStudents((prev) => prev.filter((s) => String(s._id) !== String(studentId)));
    } catch (err) {
      setStudentsError(err.message || 'Failed to unenroll student');
    } finally {
      setEnrollmentSaving(false);
    }
  };

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
            <button className="btn btn-ghost" onClick={() => navigate(`/teacher/students?courseId=${courseId}`)}>
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
                Enrollment
              </h2>
              <div className="divider my-2"></div>

              {!canManageEnrollment ? (
                <p className="text-sm text-base-content/60">Enrollment is managed by teachers/admins.</p>
              ) : (
                <div className="space-y-3">
                  {studentsError ? (
                    <div className="alert alert-warning">
                      <span>{studentsError}</span>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <select
                      className="select select-bordered w-full"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      disabled={enrollmentSaving}
                    >
                      <option value="">Select a student to enroll…</option>
                      {allStudents
                        .filter((s) => {
                          if (!courseProgramId) return true;
                          const studentProgramId = typeof s?.program === 'string' ? s.program : s?.program?._id;
                          if (!studentProgramId) return false;
                          return String(studentProgramId) === String(courseProgramId);
                        })
                        .map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.username})
                          </option>
                        ))}
                    </select>
                    <button
                      className={`btn btn-primary ${enrollmentSaving ? 'loading' : ''}`}
                      type="button"
                      onClick={handleEnrollSelected}
                      disabled={!selectedStudentId || enrollmentSaving}
                    >
                      Enroll
                    </button>
                  </div>

                  {studentsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading roster…
                    </div>
                  ) : enrolledStudents.length === 0 ? (
                    <p className="text-sm text-base-content/60">No students enrolled yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th className="text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrolledStudents.map((s) => (
                            <tr key={s._id}>
                              <td>
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs text-base-content/60">{s.username}</div>
                              </td>
                              <td className="text-right">
                                <button
                                  className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content"
                                  type="button"
                                  onClick={() => handleUnenroll(s._id)}
                                  disabled={enrollmentSaving}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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
