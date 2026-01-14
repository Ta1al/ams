import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const MyAssignmentsPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/courses`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  }, [apiUrl, user?.token]);

  const fetchAssignments = useCallback(async (courseId) => {
    if (!courseId) {
      setAssignments([]);
      setSubmissions({});
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

  const fetchMySubmissions = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/submissions/my-submissions`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const submissionsMap = {};
        (Array.isArray(data) ? data : []).forEach((sub) => {
          submissionsMap[sub.assignment._id] = sub;
        });
        setSubmissions(submissionsMap);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  }, [apiUrl, user?.token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchAssignments(selectedCourseId);
    fetchMySubmissions();
  }, [selectedCourseId, fetchAssignments, fetchMySubmissions]);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiUrl}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          submissionText,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit assignment');

      setSuccess('Assignment submitted successfully!');
      setSubmissionText('');
      setSelectedAssignment(null);
      fetchMySubmissions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();
  const getMySubmission = (assignmentId) => submissions[assignmentId];

  const getAssignmentStatus = (assignment) => {
    const submission = getMySubmission(assignment._id);
    if (!submission) return 'Not Started';
    if (submission.status === 'graded') return `Graded: ${submission.grade}/${assignment.totalPoints}`;
    if (submission.status === 'submitted') return 'Submitted';
    return submission.status;
  };

  const getStatusColor = (assignment) => {
    const submission = getMySubmission(assignment._id);
    if (!submission) return isOverdue(assignment.dueDate) ? 'badge-error' : 'badge-warning';
    if (submission.status === 'graded') return 'badge-success';
    if (submission.status === 'submitted') return 'badge-info';
    return 'badge-ghost';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Assignments</h1>
          <p className="text-base-content/60 mt-1">Submit and track your assignments</p>
        </div>

        {error && (
          <div className="alert alert-error flex gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success flex gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
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

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : !selectedCourseId ? (
            <div className="col-span-full text-center py-8 text-base-content/60">
              Select a course to view assignments
            </div>
          ) : assignments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-base-content/60">
              No assignments yet
            </div>
          ) : (
            assignments.map((assignment) => {
              const submission = getMySubmission(assignment._id);
              const isLate = submission?.isLate;
              const overdue = isOverdue(assignment.dueDate) && !submission;

              return (
                <div key={assignment._id} className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title text-lg">{assignment.title}</h2>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-base-content/70">
                        <Calendar className="w-4 h-4" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                        {new Date(assignment.dueDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`badge ${getStatusColor(assignment)}`}>
                          {getAssignmentStatus(assignment)}
                        </span>
                        {isLate && <span className="badge badge-sm badge-error">Late</span>}
                        {overdue && !submission && (
                          <span className="badge badge-sm badge-error">Overdue</span>
                        )}
                      </div>

                      <p className="text-base-content/70">
                        Points: <span className="font-semibold">{assignment.totalPoints}</span>
                      </p>

                      {submission?.feedback && (
                        <div className="bg-base-200 p-2 rounded-lg">
                          <p className="text-xs font-semibold mb-1">Feedback:</p>
                          <p className="text-xs">{submission.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="card-actions justify-end mt-4">
                      {submission?.status === 'graded' || submission?.status === 'returned' ? (
                        <button className="btn btn-sm btn-disabled">Graded</button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setSubmissionText(submission?.submissionText || '');
                          }}
                          className="btn btn-sm btn-primary gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {submission ? 'Update' : 'Submit'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submission Modal */}
        {selectedAssignment && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{selectedAssignment.title}</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm text-base-content/70">{selectedAssignment.description}</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Due:</span>{' '}
                    {new Date(selectedAssignment.dueDate).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">Points:</span> {selectedAssignment.totalPoints}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Your Answer</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    rows={6}
                    placeholder="Enter your submission text here..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !submissionText}
                    className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop" onClick={() => setSelectedAssignment(null)} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAssignmentsPage;
