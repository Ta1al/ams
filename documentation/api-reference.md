# API Reference

> **Note**: This documentation is automatically generated from the backend code.
> Last updated: 2026-01-14T16:39:30.136Z

## Overview

This document provides a comprehensive reference for all API endpoints in the AMS backend.

## Endpoints by Controller

### assignmentController

#### `POST /api/assignments`

#### `GET /api/assignments/course/:courseId`

#### `GET /api/assignments/:id`

#### `PUT /api/assignments/:id`

#### `DELETE /api/assignments/:id`

#### `GET /api/assignments/:id/submissions`

**Handler Functions:**
- `ensureCourseTeacher`
- `createAssignment`
- `getAssignments`
- `getAssignmentById`
- `updateAssignment`
- `deleteAssignment`
- `getAssignmentSubmissions`

### attendanceController

**Handler Functions:**
- `ensureCourseAccess`
- `markAttendance`
- `getAttendanceForCourse`
- `getStudentAttendance`
- `getMyAttendance`
- `updateAttendance`
- `deleteAttendance`
- `getCourseStats`
- `generateReport`

### authController

#### `POST /api/auth/login`

**Handler Functions:**
- `loginUser`

### classController

#### `GET /api/classes`

#### `GET /api/classes/:id`

#### `POST /api/classes`

#### `PUT /api/classes/:id`

#### `DELETE /api/classes/:id`

#### `GET /api/classes/:id/students`

**Handler Functions:**
- `getClasses`
- `getClassById`
- `createClass`
- `updateClass`
- `deleteClass`
- `getClassStudents`

### courseController

#### `GET /api/courses`

#### `GET /api/courses/:id`

#### `POST /api/courses`

#### `PUT /api/courses/:id`

#### `DELETE /api/courses/:id`

**Handler Functions:**
- `getCourses`
- `getCourseById`
- `createCourse`
- `updateCourse`
- `deleteCourse`
- `enrollStudents`
- `bulkEnrollByProgram`
- `unenrollStudent`
- `getEnrolledStudents`
- `getStudentCourses`

### dashboardController

#### `GET /api/dashboard/stats`

**Handler Functions:**
- `getDashboardStats`

### departmentController

#### `GET /api/departments`

#### `POST /api/departments`

#### `DELETE /api/departments/:id`

**Handler Functions:**
- `getDepartments`
- `createDepartment`
- `deleteDepartment`

### disciplineController

#### `GET /api/disciplines`

#### `POST /api/disciplines`

#### `DELETE /api/disciplines/:id`

**Handler Functions:**
- `getDisciplines`
- `createDiscipline`
- `deleteDiscipline`

### divisionController

#### `GET /api/divisions`

#### `POST /api/divisions`

#### `DELETE /api/divisions/:id`

**Handler Functions:**
- `getDivisions`
- `createDivision`
- `deleteDivision`

### facultyController

#### `GET /api/faculties`

#### `POST /api/faculties`

#### `DELETE /api/faculties/:id`

**Handler Functions:**
- `getFaculties`
- `createFaculty`
- `deleteFaculty`

### programController

#### `GET /api/programs`

#### `POST /api/programs`

#### `PUT /api/programs/:id`

#### `DELETE /api/programs/:id`

**Handler Functions:**
- `getPrograms`
- `createProgram`
- `updateProgram`
- `deleteProgram`

### submissionController

#### `POST /api/submissions`

#### `GET /api/submissions/:id`

#### `GET /api/submissions/my-submissions`

#### `PUT /api/submissions/:id`

#### `PUT /api/submissions/:id/grade`

#### `POST /api/submissions/bulk-grade`

#### `GET /api/submissions/student/:studentId`

#### `GET /api/submissions/assignment/:assignmentId/student/:studentId`

**Handler Functions:**
- `createSubmission`
- `getSubmission`
- `getMySubmissions`
- `updateSubmission`
- `gradeSubmission`
- `bulkGrade`
- `getStudentSubmissions`
- `getSubmissionByAssignmentAndStudent`

### userController

#### `GET /api/users`

#### `GET /api/users/:id`

#### `POST /api/users`

#### `PUT /api/users/:id`

#### `DELETE /api/users/:id`

**Handler Functions:**
- `validateStudentClass`
- `getUsers`
- `getUser`
- `createUser`
- `updateUser`
- `deleteUser`

## Route Files

> **Note**: Routes marked as `ROUTE` use `router.route()` which can handle multiple HTTP methods on the same path.

### assignmentRoutes

**Endpoints:**

- `GET /course/:courseId`
- `GET /:id`
- `GET /:id/submissions`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

**Middleware:**
- middleware/authMiddleware

### attendanceRoutes

**Endpoints:**

- `GET /course/:courseId`
- `GET /student/:studentId`
- `GET /my-attendance`
- `GET /stats/:courseId`
- `GET /report`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

**Middleware:**
- middleware/authMiddleware

### authRoutes

**Endpoints:**

- `POST /login`

### classRoutes

**Endpoints:**

- `GET /:id/students`
- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

### courseRoutes

**Endpoints:**

- `GET /student/:studentId`
- `GET /:id/students`
- `POST /:id/enroll`
- `POST /:id/enroll-bulk`
- `DELETE /:id/unenroll/:studentId`
- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

### dashboardRoutes

**Endpoints:**

- `GET /stats`

**Middleware:**
- middleware/authMiddleware

### departmentRoutes

**Endpoints:**

- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

### disciplineRoutes

**Endpoints:**

- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

### divisionRoutes

**Endpoints:**

- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

### facultyRoutes

**Endpoints:**

- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

### programRoutes

**Endpoints:**

- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

### submissionRoutes

**Endpoints:**

- `GET /my-submissions`
- `GET /assignment/:assignmentId/student/:studentId`
- `GET /student/:studentId`
- `GET /:id`
- `POST /`
- `POST /bulk-grade`
- `PUT /:id`
- `PUT /:id/grade`

**Middleware:**
- middleware/authMiddleware

### userRoutes

**Endpoints:**

- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

## Middleware

### authMiddleware

**Functions:**
- `protect`

