---
name: Create Attendance Controller and Routes
about: Implement backend API endpoints for attendance management
title: '[Backend] Create Attendance Controller and Routes'
labels: 'backend, api, priority: critical, phase: 1'
assignees: ''
---

## Description
Implement backend API endpoints for attendance management. This enables teachers to mark attendance, view records, and allows students to view their own attendance.

## Priority
**Critical** - Required for Phase 1

## Estimated Effort
3-4 hours

## Requirements
- Teachers can mark attendance for their courses
- Teachers can view/edit attendance records
- Students can view their own attendance
- Admins can view all attendance records
- Support bulk attendance marking (all present/absent)
- Calculate attendance statistics

## API Endpoints to Implement
```
POST   /api/attendance                    - Mark/create attendance (Teacher)
GET    /api/attendance/course/:courseId   - Get attendance for a course (Teacher)
GET    /api/attendance/student/:studentId - Get student attendance (Student/Teacher/Admin)
GET    /api/attendance/my-attendance      - Get logged-in student's attendance
PUT    /api/attendance/:id                - Update attendance record (Teacher)
DELETE /api/attendance/:id                - Delete attendance record (Admin/Teacher)
GET    /api/attendance/stats/:courseId    - Get attendance statistics for course
GET    /api/attendance/report             - Generate attendance reports (Admin)
```

## File Locations
- `/backend/controllers/attendanceController.js`
- `/backend/routes/attendanceRoutes.js`

## Acceptance Criteria
- [ ] Controller created in `/backend/controllers/attendanceController.js`
- [ ] Routes created in `/backend/routes/attendanceRoutes.js`
- [ ] All CRUD operations implemented (Create, Read, Update, Delete)
- [ ] Proper authorization (only teachers of course can mark attendance)
- [ ] Input validation and error handling for all endpoints
- [ ] Attendance statistics calculation (percentage, trends by student/course)
- [ ] Routes registered in `server.js`: `app.use('/api/attendance', ...)`
- [ ] All routes protected with `protect` middleware
- [ ] Teacher-only routes protected with `authorize('teacher', 'admin')`

## Controller Functions to Implement
1. `markAttendance` - Create new attendance record
2. `getAttendanceForCourse` - Get all attendance records for a course
3. `getStudentAttendance` - Get attendance for specific student
4. `getMyAttendance` - Get logged-in student's attendance
5. `updateAttendance` - Update existing attendance record
6. `deleteAttendance` - Delete attendance record
7. `getCourseStats` - Calculate attendance statistics
8. `generateReport` - Generate attendance report

## Authorization Rules
- **Mark/Update/Delete Attendance**: Teacher of the course or Admin
- **View Course Attendance**: Teacher of the course or Admin
- **View Student Attendance**: The student themselves, their teachers, or Admin
- **Generate Reports**: Admin only

## Technical Notes
- Use async/await for all database operations
- Implement try/catch blocks for error handling
- Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Validate that teacher is assigned to the course before allowing attendance marking
- Calculate statistics: total classes, attended, absent, percentage

## Sample Response Format
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "course": {...},
    "date": "2026-01-07",
    "studentRecords": [
      {
        "student": {...},
        "status": "present"
      }
    ],
    "markedBy": {...}
  }
}
```

## Dependencies
- Issue #1: Create Attendance Model (must be completed first)

## Related Issues
- Issue #3: Create Course Enrollment System (needed for proper student-course linking)
- Issue #4: Integrate Attendance Frontend with Backend API (will consume these APIs)
