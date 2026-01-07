---
name: Create Course Enrollment System
about: Implement system to enroll students in courses
title: '[Backend] Create Course Enrollment System'
labels: 'backend, enhancement, priority: critical, phase: 1'
assignees: ''
---

## Description
Implement a system to enroll students in courses. Currently, courses have teachers but no enrolled students. This is critical for attendance tracking to work properly.

## Priority
**Critical** - Required for Phase 1

## Estimated Effort
2-3 hours

## Problem Statement
The current Course model has a teacher assigned but no way to track which students are enrolled. Without enrollment, we cannot:
- Mark attendance for specific students
- Show students their courses
- Limit attendance marking to enrolled students only

## Requirements
- Students must be enrolled in courses to have attendance tracked
- Support bulk enrollment (all students in a program/division)
- Manual enrollment/un-enrollment by admin/teacher
- View enrolled students per course
- View courses per student

## Changes Needed

### 1. Update Course Model
Add enrolledStudents field to `/backend/models/Course.js`:
```javascript
enrolledStudents: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]
```

### 2. Create Enrollment API Endpoints
File: `/backend/controllers/courseController.js` (add to existing file)

```
POST   /api/courses/:id/enroll         - Enroll students (Admin/Teacher)
POST   /api/courses/:id/enroll-bulk    - Bulk enroll by program/division
DELETE /api/courses/:id/unenroll/:studentId - Unenroll student
GET    /api/courses/:id/students       - Get enrolled students
GET    /api/courses/student/:studentId - Get student's courses
```

## Acceptance Criteria
- [ ] Course model updated with `enrolledStudents` array field
- [ ] Enrollment controller functions added to `courseController.js`:
  - `enrollStudents` - Enroll one or more students
  - `bulkEnrollByProgram` - Enroll all students from a program/division
  - `unenrollStudent` - Remove student from course
  - `getEnrolledStudents` - Get list of enrolled students
  - `getStudentCourses` - Get courses for a specific student
- [ ] Routes added to `/backend/routes/courseRoutes.js`
- [ ] Authorization checks (only course teacher or admin can enroll)
- [ ] Validation: cannot enroll students not in the program/division
- [ ] Prevent duplicate enrollments
- [ ] Cascading: when deleting a course, handle enrolled students

## API Request/Response Examples

### Enroll Students
**Request**: `POST /api/courses/64abc123.../enroll`
```json
{
  "studentIds": ["64def456...", "64ghi789..."]
}
```

**Response**:
```json
{
  "success": true,
  "message": "2 students enrolled successfully",
  "data": {
    "course": {...},
    "enrolledCount": 2
  }
}
```

### Bulk Enroll by Program
**Request**: `POST /api/courses/64abc123.../enroll-bulk`
```json
{
  "programId": "64xyz123...",
  "divisionId": "64abc789..." // optional
}
```

## Authorization Rules
- **Enroll/Unenroll**: Teacher of the course or Admin
- **View Enrolled Students**: Teacher of the course or Admin
- **View Student Courses**: The student themselves, their teachers, or Admin

## Technical Notes
- Validate that students being enrolled exist and have role 'student'
- Check that students belong to appropriate program/division for the course
- Use `$addToSet` to prevent duplicate enrollments
- Use `$pull` to remove students
- Populate student details when returning enrolled students list

## Testing Checklist
- [ ] Can enroll single student
- [ ] Can enroll multiple students at once
- [ ] Bulk enrollment by program works
- [ ] Cannot enroll same student twice
- [ ] Cannot enroll non-student users
- [ ] Can unenroll students
- [ ] Only authorized users can enroll
- [ ] Getting enrolled students returns populated data

## Dependencies
None - Can be implemented independently

## Related Issues
- Issue #2: Create Attendance Controller (will use enrolled students)
- Issue #4: Integrate Attendance Frontend (will display enrolled students)
