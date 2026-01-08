# API Reference

> **Note**: This documentation is automatically generated from the backend code.
> Last updated: 2026-01-08T17:30:15.519Z

## Overview

This document provides a comprehensive reference for all API endpoints in the AMS backend.

## Endpoints by Controller

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

### programController

#### `GET /api/programs`

#### `POST /api/programs`

#### `PUT /api/programs/:id`

#### `DELETE /api/programs/:id`

#### `GET /api/programs/departments`

**Handler Functions:**
- `getPrograms`
- `createProgram`
- `updateProgram`
- `deleteProgram`
- `getDepartments`

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

### programRoutes

**Endpoints:**

- `GET /departments`
- `ROUTE /`
- `ROUTE /:id`

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

