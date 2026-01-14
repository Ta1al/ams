import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const AssignmentGradingPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setAssignment(data.assignment);
        setSubmissions(data.submissions || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.token, assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/submissions/${selectedSubmission._id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          grade: parseFloat(grade),
          feedback,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to grade submission');

      setGrade('');
      setFeedback('');
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusBadgeColor = (status) => {
    const colors = {
      assigned: 'badge-info',
      submitted: 'badge-warning',
      graded: 'badge-success',
      returned: 'badge-primary',
    };
    return colors[status] || 'badge-ghost';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/teacher/assignments')} className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold">{assignment?.title}</h1>
            <p className="text-base-content/60 mt-1">Grade submissions</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error flex gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="stat bg-base-100 rounded-lg">
              <div className="stat-title">Total</div>
              <div className="stat-value text-lg">{stats.total}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg">
              <div className="stat-title">Submitted</div>
              <div className="stat-value text-lg text-warning">{stats.submitted}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg">
              <div className="stat-title">Graded</div>
              <div className="stat-value text-lg text-success">{stats.graded}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-lg text-error">{stats.pending}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg">
              <div className="stat-title">Avg Grade</div>
              <div className="stat-value text-lg">{stats.averageGrade}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="card bg-base-100 shadow-xl lg:col-span-1">
            <div className="card-body">
              <h2 className="card-title">Submissions</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.length === 0 ? (
                  <p className="text-center text-base-content/60 py-4">No submissions</p>
                ) : (
                  submissions.map((submission) => (
                    <button
                      key={submission._id}
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setGrade(submission.grade || '');
                        setFeedback(submission.feedback || '');
                      }}
                      className={`p-3 rounded-lg text-left transition ${
                        selectedSubmission?._id === submission._id
                          ? 'bg-primary text-primary-content'
                          : 'bg-base-200 hover:bg-base-300'
                      }`}
                    >
                      <p className="font-semibold text-sm">{submission.student?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge badge-sm ${statusBadgeColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        {submission.isLate && <span className="badge badge-sm badge-error">Late</span>}
                      </div>
                      {submission.grade !== null && (
                        <p className="text-xs mt-1">Grade: {submission.grade}/{assignment?.totalPoints}</p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Grading Panel */}
          <div className="card bg-base-100 shadow-xl lg:col-span-2">
            <div className="card-body">
              {!selectedSubmission ? (
                <div className="text-center py-12">
                  <p className="text-base-content/60">Select a submission to grade</p>
                </div>
              ) : (
                <form onSubmit={handleGradeSubmission} className="space-y-4">
                  <h2 className="card-title">
                    {selectedSubmission.student?.name}
                    {selectedSubmission.isLate && <span className="badge badge-error badge-sm">Late</span>}
                  </h2>

                  {/* Submission Details */}
                  <div className="divider">Submission</div>
                  <div>
                    <p className="text-sm text-base-content/60">Status</p>
                    <p className="font-semibold">
                      <span className={`badge ${statusBadgeColor(selectedSubmission.status)}`}>
                        {selectedSubmission.status}
                      </span>
                    </p>
                  </div>

                  {selectedSubmission.submittedAt && (
                    <div>
                      <p className="text-sm text-base-content/60">Submitted</p>
                      <p className="font-semibold">
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedSubmission.submissionText && (
                    <div>
                      <p className="text-sm text-base-content/60 mb-2">Text Submission</p>
                      <div className="bg-base-200 p-3 rounded-lg text-sm whitespace-pre-wrap">
                        {selectedSubmission.submissionText}
                      </div>
                    </div>
                  )}

                  {/* Grading Form */}
                  <div className="divider">Grade</div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Grade (out of {assignment?.totalPoints})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={assignment?.totalPoints}
                      step="0.5"
                      className="input input-bordered"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Feedback</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      rows={4}
                      placeholder="Provide feedback for the student..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !grade}
                    className={`btn btn-primary w-full ${saving ? 'loading' : ''}`}
                  >
                    {saving ? 'Saving...' : 'Save Grade'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentGradingPage;
