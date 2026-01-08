# Frontend Structure

> **Note**: This documentation is automatically generated from the frontend code.
> Last updated: 2026-01-08T17:30:15.525Z

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
| /admin/disciplines | ProtectedRoute | admin |
| /admin/courses | ProtectedRoute | admin |
| /admin/classes | ProtectedRoute | admin |
| /teacher/classes | ProtectedRoute | teacher, admin |
| /teacher/students | ProtectedRoute | teacher, admin |
| /teacher/attendance | ProtectedRoute | teacher, admin |
| /courses/:courseId | ProtectedRoute | admin, teacher, student |
| /student/attendance | ProtectedRoute | student |
| / | Navigate | Public |
| * | Navigate | Public |

## Pages

Total pages: 15

- pages/CourseDetailPage.jsx
- pages/Dashboard.jsx
- pages/Login.jsx
- pages/admin/ClassesPage.jsx
- pages/admin/CoursesPage.jsx
- pages/admin/DisciplinesPage.jsx
- pages/admin/ProgramsPage.jsx
- pages/admin/UsersPage.jsx
- pages/dashboards/AdminDashboard.jsx
- pages/dashboards/StudentDashboard.jsx
- pages/dashboards/TeacherDashboard.jsx
- pages/student/MyAttendancePage.jsx
- pages/teacher/AttendancePage.jsx
- pages/teacher/ClassesPage.jsx
- pages/teacher/StudentsPage.jsx

## Components

Total components: 3

- components/DashboardLayout.jsx
- components/ProtectedRoute.jsx
- components/modals/UserModal.jsx

## API Integration

The frontend communicates with the backend using the Fetch API.

Total API calls: 24

### API Endpoints Used

- DELETE /api/disciplines/
- DELETE /api/programs/
- DELETE /api/users/
- GET /api/classes
- GET /api/classes//students
- GET /api/classes?program=
- GET /api/courses
- GET /api/courses/
- GET /api/disciplines
- GET /api/disciplines?programId=
- GET /api/programs
- GET /api/programs/departments
- GET /api/users?role=student
- GET /api/users?role=teacher
- POST /api/classes
- POST /api/courses
- POST /api/disciplines

## Authentication

- **Context**: AuthContext provides authentication state
- **Storage**: User data and token stored in localStorage
- **Protected Routes**: ProtectedRoute component enforces authentication
- **Roles**: admin, teacher, student

