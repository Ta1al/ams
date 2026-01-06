# API Reference

> **Note**: This documentation is automatically generated from the backend code.
> Last updated: 2026-01-06T17:53:33.699Z

## Overview

This document provides a comprehensive reference for all API endpoints in the AMS backend.

## Endpoints by Controller

### authController

#### `POST /api/auth/login`

**Handler Functions:**
- `loginUser`

### dashboardController

#### `GET /api/dashboard/stats`

**Handler Functions:**
- `getDashboardStats`

### facultyController

#### `GET /api/faculties`

#### `POST /api/faculties`

#### `DELETE /api/faculties/:id`

**Handler Functions:**
- `getFaculties`
- `createFaculty`
- `deleteFaculty`

## Route Files

> **Note**: Routes marked as `ROUTE` use `router.route()` which can handle multiple HTTP methods on the same path.

### authRoutes

**Endpoints:**

- `POST /login`

### dashboardRoutes

**Endpoints:**

- `GET /stats`

**Middleware:**
- middleware/authMiddleware

### facultyRoutes

**Endpoints:**

- `ROUTE /`
- `ROUTE /:id`

**Middleware:**
- middleware/authMiddleware

## Middleware

### authMiddleware

**Functions:**
- `protect`

