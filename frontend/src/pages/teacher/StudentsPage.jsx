import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Search, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const StudentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [students, setStudents] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchStudents = useCallback(async () => {
    try {
      let url;
      let title = 'All Students';
      
      if (courseId) {
        // Fetch only students enrolled in this course
        url = `${apiUrl}/api/courses/${courseId}/students`;
        // Also fetch course name for display
        const courseResponse = await fetch(`${apiUrl}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          setCourseTitle(courseData.name);
        }
      } else {
        // Fetch all students (for backward compatibility)
        url = `${apiUrl}/api/users?role=student`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        // Filter only students
        const studentUsers = Array.isArray(data) 
          ? data.filter((u) => u.role === 'student')
          : [];
        setStudents(studentUsers);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.token, apiUrl, courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center justify-between">
          <div>
            {courseId ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Course
                  </button>
                </div>
                <h1 className="text-3xl font-bold">Students in {courseTitle || 'Course'}</h1>
                <p className="text-base-content/60 mt-1">Enrolled students for this course</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">Students</h1>
                <p className="text-base-content/60 mt-1">View all students in the system</p>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-base-content/50" />
              <input
                type="text"
                placeholder="Search students..."
                className="input input-bordered flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Program</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s._id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                                <span>{s.name?.charAt(0)?.toUpperCase()}</span>
                              </div>
                            </div>
                            <span className="font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="text-base-content/70">{s.username}</td>
                        <td className="text-base-content/70">
                          {s.program?.discipline?.name ? `${s.program.discipline.name} (${s.program.program || 'N/A'})` : 'Not assigned'}
                        </td>
                        <td className="text-base-content/70 text-sm">
                          {new Date(s.createdAt).toLocaleDateString()}
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

export default StudentsPage;
