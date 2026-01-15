import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Users,
  User,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

const CourseOfferingsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    teacher: '',
    class: '',
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/courses`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  }, [apiUrl, user?.token]);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users?role=teacher`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        const teacherUsers = data.filter((u) => u.role === 'teacher');
        setTeachers(teacherUsers);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  }, [apiUrl, user?.token]);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/classes`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  }, [apiUrl, user?.token]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchTeachers(), fetchClasses()]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchCourses, fetchTeachers, fetchClasses]);

  // Get the specific course being viewed
  useEffect(() => {
    const selectedCourse = courses.find((c) => c._id === courseId);
    if (selectedCourse) {
      setCourse(selectedCourse);
    }
  }, [courseId, courses]);

  // Get all offerings of this course
  const courseOfferings = useMemo(() => {
    return courses.filter(
      (c) =>
        c.name === course?.name &&
        c.code === course?.code &&
        c.program?._id === course?.program?._id &&
        c.discipline?._id === course?.discipline?._id &&
        c.department?._id === course?.department?._id
    ).map((offering) => {
      // Populate class data if only ID is present
      let populatedClass = offering.class;
      if (offering.class && typeof offering.class === 'string') {
        populatedClass = classes.find((c) => c._id === offering.class);
      }
      return { ...offering, class: populatedClass };
    });
  }, [courses, course, classes]);

  const handleAddOffering = () => {
    setFormData({ teacher: '', class: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveOffering = async (e) => {
    e.preventDefault();
    if (!formData.teacher || !formData.class) {
      setError('Please select both teacher and class');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: course.name,
        code: course.code || undefined,
        program: course.program?._id,
        discipline: course.discipline?._id,
        department: course.department?._id,
        teacher: formData.teacher,
        class: formData.class,
      };

      const response = await fetch(`${apiUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create offering');

      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffering = async (offeringId) => {
    if (!confirm('Are you sure you want to delete this offering?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/courses/${offeringId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete offering');
      fetchCourses();
    } catch (err) {
      alert(`Error: ${err.message}`);
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

  if (!course) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="btn btn-ghost gap-2"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>
          <div className="alert alert-error">
            <span>Course not found</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/admin/courses')}
              className="btn btn-ghost btn-sm gap-2 mb-3"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              {course.name}
            </h1>
            <p className="text-base-content/60 mt-2">
              Code: <span className="font-mono">{course.code || 'N/A'}</span>
            </p>
            <p className="text-base-content/60">
              Program: <span className="font-semibold">{course.program?.level || 'N/A'}</span>
            </p>
            <p className="text-base-content/60">
              Discipline: <span className="font-semibold">{course.discipline?.name || 'N/A'}</span>
            </p>
          </div>
          <button
            onClick={handleAddOffering}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Add Offering
          </button>
        </div>

        {/* Course Offerings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseOfferings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <p className="text-base-content/60 mb-4">No offerings for this course yet</p>
              <button
                onClick={handleAddOffering}
                className="btn btn-primary gap-2"
              >
                <Plus size={18} />
                Create First Offering
              </button>
            </div>
          ) : (
            courseOfferings.map((offering) => (
              <div key={offering._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Users size={20} />
                    Offering
                  </h2>

                  {/* Teacher Info */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User size={18} className="text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-base-content/60 uppercase">
                          Teacher
                        </p>
                        <p className="font-medium">
                          {offering.teacher?.name || 'Unassigned'}
                        </p>
                        {offering.teacher?.username && (
                          <p className="text-sm text-base-content/60">
                            @{offering.teacher.username}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Class/Batch Info */}
                    <div className="flex items-start gap-3">
                      <Users size={18} className="text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-base-content/60 uppercase">
                          Class/Batch
                        </p>
                        <p className="font-medium">
                          {offering.class?.program?.level || offering.class?.level || 'N/A'} – {offering.class?.section || 'N/A'}
                        </p>
                        {offering.class?.sessionLabel && (
                          <p className="text-sm text-base-content/60">
                            {offering.class.sessionLabel}
                          </p>
                        )}
                        {!offering.class?.sessionLabel && offering.class?.session && (
                          <p className="text-sm text-base-content/60">
                            {offering.class.session.startYear}-{offering.class.session.endYear}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Enrolled Students Count */}
                    <div className="divider my-2" />
                    <p className="text-sm text-base-content/60">
                      <span className="font-semibold text-primary">
                        {offering.enrolledStudents?.length || 0}
                      </span>{' '}
                      students enrolled
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="card-actions justify-between mt-4">
                    <button
                      onClick={() => navigate(`/courses/${offering._id}`)}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteOffering(offering._id)}
                      className="btn btn-error btn-ghost btn-sm"
                      title="Delete offering"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Offering Modal */}
        {isModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Add Course Offering</h3>
              {error && (
                <div className="alert alert-error mb-3">
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSaveOffering} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Course</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={course.name}
                    disabled
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Teacher</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Class/Batch</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.program?.level || 'Level'} – {c.section} (
                        {c.sessionLabel || `${c.session?.startYear}-${c.session?.endYear}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-info/10 rounded-lg p-3 text-sm">
                  <p>
                    This will create a new offering of <span className="font-semibold">{course.name}</span> for the selected teacher and class.
                  </p>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary ${saving ? 'loading' : ''}`}
                    disabled={saving}
                  >
                    {saving ? 'Creating...' : 'Create Offering'}
                  </button>
                </div>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setIsModalOpen(false)}>close</button>
            </form>
          </dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseOfferingsPage;
