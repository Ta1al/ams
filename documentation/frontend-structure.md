# Frontend Structure

> **Note**: This documentation is automatically generated from the frontend code.
> Last updated: 2026-01-07T16:21:43.873Z

## Architecture Overview

The frontend is built with React and follows a component-based architecture:

```
frontend/src/
├── pages/           # Page components (routes)
├── components/      # Reusable components
├── context/         # React Context (AuthContext)
├── hooks/           # Custom React hooks
├── assets/          # Static assets
└── App.jsx          # Main app with routes
```

## Routing

The application uses React Router for client-side routing:

| Route | Component | Access Control |
|-------|-----------|----------------|
| /login | Login | admin |
| /dashboard | ProtectedRoute | admin |
| /admin/users | ProtectedRoute | admin |
| /admin/programs | ProtectedRoute | admin |
| /teacher/students | ProtectedRoute | teacher, admin |
| /teacher/attendance | ProtectedRoute | teacher, admin |
| /student/attendance | ProtectedRoute | student |
| / | Navigate | Public |
| * | Navigate | Public |

## Pages

Total pages: 10

- pages/Dashboard.jsx
- pages/Login.jsx
- pages/admin/ProgramsPage.jsx
- pages/admin/UsersPage.jsx
- pages/dashboards/AdminDashboard.jsx
- pages/dashboards/StudentDashboard.jsx
- pages/dashboards/TeacherDashboard.jsx
- pages/student/MyAttendancePage.jsx
- pages/teacher/AttendancePage.jsx
- pages/teacher/StudentsPage.jsx

## Components

Total components: 3

- components/DashboardLayout.jsx
- components/ProtectedRoute.jsx
- components/modals/UserModal.jsx

## API Integration

The frontend communicates with the backend using the Fetch API.

Total API calls: 8

### API Endpoints Used

- DELETE /api/programs/
- DELETE /api/users/
- GET /api/departments
- GET /api/programs
- GET /api/programs/divisions
- GET /api/users
- GET /api/users?role=student

## Authentication

- **Context**: AuthContext provides authentication state
- **Storage**: User data and token stored in localStorage
- **Protected Routes**: ProtectedRoute component enforces authentication
- **Roles**: admin, teacher, student

