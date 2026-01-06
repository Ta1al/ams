import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// Admin pages
import UsersPage from './pages/admin/UsersPage';
import ProgramsPage from './pages/admin/ProgramsPage';
// Teacher pages
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

          {/* Teacher Routes */}
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
