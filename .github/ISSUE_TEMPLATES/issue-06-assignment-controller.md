---
name: Create Assignment Controller and Routes
about: Implement backend API for assignment and submission management
title: '[Backend] Create Assignment Controller and Routes'
labels: 'backend, api, priority: high, phase: 3'
assignees: ''
---

## Description
Implement backend API for assignment and submission management. This provides endpoints for teachers to create/manage assignments and for students to submit work and view grades.

## Priority
**High** - Required for Phase 3

## Estimated Effort
4-5 hours

## API Endpoints to Implement

### Assignment Management (Teacher)
```
POST   /api/assignments                      - Create assignment
GET    /api/assignments/course/:courseId     - Get all assignments for a course
GET    /api/assignments/:id                  - Get single assignment details
PUT    /api/assignments/:id                  - Update assignment
DELETE /api/assignments/:id                  - Delete assignment
GET    /api/assignments/:id/submissions      - Get all submissions for assignment
GET    /api/assignments/teacher/my-assignments - Get teacher's assignments
```

### Submission Management (Student)
```
POST   /api/submissions                      - Create/submit assignment
GET    /api/submissions/assignment/:assignmentId/student/:studentId - Get specific submission
GET    /api/submissions/my-submissions       - Get logged-in student's submissions
PUT    /api/submissions/:id                  - Update submission (before grading)
GET    /api/submissions/student/:studentId   - Get all submissions for a student
```

### Grading (Teacher)
```
PUT    /api/submissions/:id/grade            - Grade a submission
POST   /api/submissions/bulk-grade           - Grade multiple submissions
```

## File Locations
- `/backend/controllers/assignmentController.js`
- `/backend/controllers/submissionController.js`
- `/backend/routes/assignmentRoutes.js`
- `/backend/routes/submissionRoutes.js`

## Acceptance Criteria

### Assignment Controller
- [ ] Controller created with all CRUD operations
- [ ] `createAssignment` - Create new assignment (teacher only)
- [ ] `getAssignments` - Get assignments for a course
- [ ] `getAssignmentById` - Get single assignment with details
- [ ] `updateAssignment` - Update assignment details
- [ ] `deleteAssignment` - Delete assignment and related submissions
- [ ] `getAssignmentSubmissions` - Get all student submissions
- [ ] Authorization: Only teacher of course or admin can create/edit/delete

### Submission Controller
- [ ] Controller created with submission workflow
- [ ] `createSubmission` - Student submits assignment
- [ ] `getSubmission` - Get specific submission
- [ ] `getMySubmissions` - Get logged-in student's submissions
- [ ] `updateSubmission` - Update submission (only if not graded)
- [ ] `gradeSubmission` - Teacher grades submission
- [ ] `bulkGrade` - Grade multiple submissions at once
- [ ] Auto-create submission records when assignment is created
- [ ] Auto-detect late submissions (compare submittedAt vs dueDate)

### Routes
- [ ] Routes created and properly organized
- [ ] All routes protected with `protect` middleware
- [ ] Teacher-only routes protected with `authorize('teacher', 'admin')`
- [ ] Student routes protected appropriately
- [ ] Routes registered in `server.js`

## Controller Functions Detail

### Assignment Controller

**createAssignment**
```javascript
// POST /api/assignments
// Body: { title, description, courseId, dueDate, totalPoints, assignmentType }
// - Validate teacher is assigned to course
// - Create assignment
// - Auto-create submission records for all enrolled students (status: 'assigned')
// - Return created assignment
```

**getAssignments**
```javascript
// GET /api/assignments/course/:courseId
// Query: ?status=upcoming&sortBy=dueDate
// - Get all assignments for course
// - Support filtering (upcoming, past, by type)
// - Sort by due date or creation date
// - Populate course and assignedBy fields
```

**updateAssignment**
```javascript
// PUT /api/assignments/:id
// Body: { title, description, dueDate, etc. }
// - Validate teacher is assigned to course
// - Update assignment
// - If due date changed, update isLate status on submissions
```

**deleteAssignment**
```javascript
// DELETE /api/assignments/:id
// - Validate authorization
// - Delete assignment
// - Delete all related submissions
// - Return success message
```

**getAssignmentSubmissions**
```javascript
// GET /api/assignments/:id/submissions
// Query: ?status=submitted&sortBy=submittedAt
// - Get all submissions for assignment
// - Populate student details
// - Support filtering by status
// - Include submission statistics
```

### Submission Controller

**createSubmission**
```javascript
// POST /api/submissions
// Body: { assignmentId, submissionText, attachments }
// - Validate student is enrolled in course
// - Check if assignment exists
// - Update existing submission or create if doesn't exist
// - Set submittedAt timestamp
// - Calculate isLate (compare with assignment.dueDate)
// - Update status to 'submitted'
```

**gradeSubmission**
```javascript
// PUT /api/submissions/:id/grade
// Body: { grade, feedback }
// - Validate teacher is assigned to course
// - Validate grade <= assignment.totalPoints
// - Update submission with grade and feedback
// - Set gradedBy and gradedAt
// - Update status to 'graded'
```

## Authorization Rules
- **Create/Update/Delete Assignment**: Teacher of the course or Admin
- **View Assignments**: Enrolled students, course teacher, or Admin
- **Submit Assignment**: Enrolled student only
- **Grade Submission**: Course teacher or Admin
- **View Submissions**: Student (own only), course teacher, or Admin

## Validation Rules
- Assignment must belong to a valid course
- Teacher must be assigned to the course
- Student must be enrolled in the course
- Grade must be between 0 and totalPoints
- Cannot update submission after grading (create new version instead)
- Due date must be in future for new assignments

## Business Logic

### Auto-Create Submissions
When an assignment is created, automatically create submission records for all enrolled students:
```javascript
const students = await Course.findById(courseId).select('enrolledStudents');
const submissions = students.enrolledStudents.map(studentId => ({
  assignment: assignmentId,
  student: studentId,
  status: 'assigned'
}));
await Submission.insertMany(submissions);
```

### Late Submission Detection
```javascript
const isLate = new Date(submittedAt) > new Date(assignment.dueDate);
```

### Statistics Calculation
```javascript
{
  total: totalSubmissions,
  submitted: submittedCount,
  graded: gradedCount,
  pending: pendingCount,
  averageGrade: avgGrade,
  submissionRate: (submittedCount / totalSubmissions) * 100
}
```

## Error Handling
- 400: Invalid input data
- 401: Not authenticated
- 403: Not authorized (not teacher of course)
- 404: Assignment/Submission not found
- 409: Conflict (e.g., student not enrolled)
- 500: Server error

## Sample Response Formats

**Create Assignment Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Homework 1",
    "description": "Complete chapters 1-3",
    "course": {...},
    "dueDate": "2026-01-15T23:59:59Z",
    "totalPoints": 100,
    "assignmentType": "homework",
    "submissionsCreated": 25
  }
}
```

**Get Submissions Response**:
```json
{
  "success": true,
  "data": {
    "assignment": {...},
    "submissions": [...],
    "stats": {
      "total": 25,
      "submitted": 20,
      "graded": 15,
      "pending": 5,
      "averageGrade": 85.5
    }
  }
}
```

## Testing Checklist
- [ ] Teacher can create assignment for their course
- [ ] Submissions auto-created for enrolled students
- [ ] Student can submit assignment
- [ ] Late submissions flagged correctly
- [ ] Teacher can grade submissions
- [ ] Grade validation works (cannot exceed totalPoints)
- [ ] Cannot submit after grading without teacher permission
- [ ] Statistics calculate correctly
- [ ] Authorization rules enforced
- [ ] Cascade delete works (deleting assignment deletes submissions)

## Dependencies
- Issue #5: Create Assignment Model (must be complete)
- Issue #3: Create Course Enrollment System (needed for enrolled students)

## Related Issues
- Issue #7: Create Assignment Management UI for Teachers
- Issue #8: Create Assignment Submission UI for Students
- Issue #12: Add File Upload System (for handling attachments)
