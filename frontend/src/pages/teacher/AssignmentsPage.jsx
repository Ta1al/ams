import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Plus, BookOpen, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const TeacherAssignmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
    assignmentType: 'homework',
    allowLateSubmissions: true,
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/courses`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.token]);

  const fetchAssignments = useCallback(async (courseId) => {
    if (!courseId) {
      setAssignments([]);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/assignments/course/${courseId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchAssignments(selectedCourseId);
  }, [selectedCourseId, fetchAssignments]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError('Select a course first');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...formData,
          courseId: selectedCourseId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create assignment');

      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        totalPoints: 100,
        assignmentType: 'homework',
        allowLateSubmissions: true,
        isPublished: true,
      });
      fetchAssignments(selectedCourseId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId, title) => {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      const response = await fetch(`${apiUrl}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (!response.ok) throw new Error('Failed to delete assignment');
      fetchAssignments(selectedCourseId);
    } catch (err) {
      setError(err.message);
    }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="text-base-content/60 mt-1">Manage and grade assignments</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedCourseId}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </button>
        </div>

        {error && (
          <div className="alert alert-error flex gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Course Selection */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <label className="label">
              <span className="label-text font-semibold">Select Course</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={loading}
            >
              <option value="">Choose a course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code || 'N/A'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Assignments</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : !selectedCourseId ? (
              <p className="text-center text-base-content/60 py-8">Select a course to view assignments</p>
            ) : assignments.length === 0 ? (
              <p className="text-center text-base-content/60 py-8">No assignments yet</p>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="p-4 border border-base-300 rounded-lg hover:border-primary transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{assignment.title}</h3>
                          <span className={`badge ${assignment.isPublished ? 'badge-success' : 'badge-warning'}`}>
                            {assignment.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span className={`badge badge-outline ${assignment.assignmentType}`}>
                            {assignment.assignmentType}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/70 mt-1">{assignment.description}</p>
                        <div className="flex gap-4 mt-3 text-sm text-base-content/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(assignment.dueDate).toLocaleDateString()}
                            {isOverdue(assignment.dueDate) && (
                              <span className="badge badge-error badge-sm">Overdue</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {assignment.totalPoints} points
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/teacher/assignments/${assignment._id}`)}
                          className="btn btn-sm btn-primary"
                        >
                          Grade
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment._id, assignment.title)}
                          className="btn btn-sm btn-ghost text-error"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Assignment Modal */}
        {isModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box max-w-md w-full">
              <h3 className="font-bold text-lg mb-4">Create Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Assignment title"
                    className="input input-bordered"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description *</span>
                  </label>
                  <textarea
                    placeholder="Assignment description"
                    className="textarea textarea-bordered"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Due Date *</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="input input-bordered"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Total Points</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.totalPoints}
                      onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.assignmentType}
                    onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                  >
                    <option value="homework">Homework</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                    <option value="exam">Exam</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Allow Late Submissions</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.allowLateSubmissions}
                      onChange={(e) => setFormData({ ...formData, allowLateSubmissions: e.target.checked })}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Published</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                  </label>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`btn btn-primary ${saving ? 'loading' : ''}`}
                  >
                    {saving ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignmentsPage;
