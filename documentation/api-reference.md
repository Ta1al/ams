# API Reference

> **Note**: This documentation is automatically generated from the backend code.
> Last updated: 2026-01-07T16:00:08.920Z

## Overview

This document provides a comprehensive reference for all API endpoints in the AMS backend.

## Endpoints by Controller

### authController

#### `POST /api/auth/login`

**Handler Functions:**
- `loginUser`

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

#### `GET /api/programs/divisions`

**Handler Functions:**
- `getPrograms`
- `createProgram`
- `updateProgram`
- `deleteProgram`
- `getDivisions`

### userController

#### `GET /api/users`

#### `GET /api/users/:id`

#### `POST /api/users`

#### `PUT /api/users/:id`

#### `DELETE /api/users/:id`

**Handler Functions:**
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

- `GET /divisions`
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

