import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Plus, BookOpen, GraduationCap, Eye } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const CoursesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    program: '',
    teacher: '',
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const selectedProgram = useMemo(
    () => programs.find((p) => p._id === formData.program),
    [programs, formData.program]
  );

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/courses`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.token]);

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/programs`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setPrograms(data);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    }
  }, [apiUrl, user?.token]);

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

  useEffect(() => {
    fetchCourses();
    fetchPrograms();
    fetchTeachers();
  }, [fetchCourses, fetchPrograms, fetchTeachers]);

  const openAddModal = () => {
    setFormData({ name: '', code: '', program: '', teacher: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProgram) {
      setError('Select a program');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        code: formData.code || undefined,
        program: selectedProgram._id,
        discipline: selectedProgram.discipline?._id,
        department: selectedProgram.discipline?.department?._id,
        teacher: formData.teacher,
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
      if (!response.ok) throw new Error(data.message || 'Failed to create course');

      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Courses</h1>
            <p className="text-base-content/60 mt-1">View and create courses</p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No courses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Program</th>
                      <th>Discipline</th>
                      <th>Department</th>
                      <th>Teacher</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c._id} className="hover">
                        <td className="font-medium">{c.name}</td>
                        <td className="text-base-content/70">{c.code || '—'}</td>
                        <td className="text-base-content/70">
                          {c.program?.discipline?.name} ({c.program?.program})
                        </td>
                        <td className="text-base-content/70">{c.discipline?.name}</td>
                        <td className="text-base-content/70">{c.department?.name}</td>
                        <td className="text-base-content/70">{c.teacher?.name}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => navigate(`/courses/${c._id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Add Course</h3>
              {error && (
                <div className="alert alert-error mb-3">
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Name</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Code</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Program</span></label>
                  <select
                    className="select select-bordered"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    required
                  >
                    <option value="">Select program</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.discipline?.name} ({p.program}) – {p.discipline?.department?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Teacher</span></label>
                  <select
                    className="select select-bordered"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    required
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.username})</option>
                    ))}
                  </select>
                </div>

                <div className="bg-base-200 rounded-lg p-3 text-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-semibold">Department / Discipline</span>
                  </div>
                  <p>
                    {selectedProgram?.discipline?.department?.name || 'Pick a program to auto-fill department'}
                  </p>
                  <p className="text-base-content/60">
                    {selectedProgram?.discipline?.name || 'Discipline will match selected program'}
                  </p>
                </div>

                <div className="modal-action">
                  <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
                    {saving ? 'Saving...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setIsModalOpen(false)}></div>
          </dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoursesPage;
