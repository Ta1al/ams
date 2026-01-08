import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseDetailPage from './pages/CourseDetailPage';
// Admin pages
import UsersPage from './pages/admin/UsersPage';
import ProgramsPage from './pages/admin/ProgramsPage';
import CoursesPage from './pages/admin/CoursesPage';
import ClassesPage from './pages/admin/ClassesPage';
// Teacher pages
import TeacherClassesPage from './pages/teacher/ClassesPage';
import TeacherStudentsPage from './pages/teacher/StudentsPage';
import TeacherAttendancePage from './pages/teacher/AttendancePage';
// Student pages
import StudentAttendancePage from './pages/student/MyAttendancePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/programs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CoursesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ClassesPage />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherStudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherAttendancePage />
              </ProtectedRoute>
            }
          />

          {/* Course Detail */}
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAttendancePage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
