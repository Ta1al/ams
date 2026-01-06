import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/DashboardLayout';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

const Dashboard = () => {
  const { role } = useAuth();

  const getDashboardContent = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return (
          <div className="text-center py-8">
            <p>Unknown role. Please contact an administrator.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {getDashboardContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
