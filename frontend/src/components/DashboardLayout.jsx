import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    if (role === 'admin') {
      return [
        ...baseItems,
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/classes', label: 'Classes', icon: ClipboardList },
        { path: '/admin/courses', label: 'Courses', icon: BookOpen },
        { path: '/admin/programs', label: 'Programs', icon: GraduationCap },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'teacher') {
      return [
        ...baseItems,
        { path: '/teacher/classes', label: 'My Classes', icon: ClipboardList },
        { path: '/teacher/attendance', label: 'Mark Attendance', icon: CalendarCheck },
        { path: '/teacher/students', label: 'Students', icon: Users },
      ];
    }

    // Student
    return [
      ...baseItems,
      { path: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
      { path: '/student/schedule', label: 'Schedule', icon: ClipboardList },
    ];
  };

  const menuItems = getMenuItems();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="drawer lg:drawer-open">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
      
      {/* Main content area */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Top navbar */}
        <div className="navbar bg-base-100 shadow-lg lg:hidden">
          <div className="flex-none">
            <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost">
              <Menu className="w-5 h-5" />
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold">AMS</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-base-200 p-6">
          {children}
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
        <aside className="w-72 min-h-screen bg-base-100 flex flex-col">
          {/* Logo/Brand */}
          <div className="p-4 border-b border-base-200">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-content" />
              </div>
              <div>
                <h1 className="text-lg font-bold">AMS</h1>
                <p className="text-xs text-base-content/60">Attendance System</p>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-base-200">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-lg">{user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-base-content/60 capitalize">{role}</p>
              </div>
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 p-4">
            <ul className="menu menu-lg gap-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={isActive(item.path) ? 'active' : ''}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-base-200">
            <button
              onClick={handleLogout}
              className="btn btn-ghost w-full justify-start gap-3 text-error"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;
