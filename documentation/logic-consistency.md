# Logic Consistency Report

> **Note**: This report is automatically generated.
> Last updated: 2026-01-14T16:39:30.142Z

## Overview

This document tracks consistency checks for the backend logic.

## Model Relationships

The following relationships are defined:

- **Attendance** references: User
- **Class** references: Department, Division, Program
- **Course** references: Department, Discipline, Program, User, User
- **Department** references: Faculty, User
- **Discipline** references: Department
- **Division** references: Department
- **Program** references: Discipline, Department
- **User** references: Program, Class, Department

## Controller Coverage

Each controller should have corresponding routes:

- **assignmentController**: 7 functions, 6 documented routes
- **attendanceController**: 9 functions, 0 documented routes
- **authController**: 1 functions, 1 documented routes
- **classController**: 6 functions, 6 documented routes
- **courseController**: 10 functions, 5 documented routes
- **dashboardController**: 1 functions, 1 documented routes
- **departmentController**: 3 functions, 3 documented routes
- **disciplineController**: 3 functions, 3 documented routes
- **divisionController**: 3 functions, 3 documented routes
- **facultyController**: 3 functions, 3 documented routes
- **programController**: 4 functions, 4 documented routes
- **submissionController**: 8 functions, 8 documented routes
- **userController**: 6 functions, 5 documented routes

## Middleware Usage

- **assignmentRoutes**: 1 middleware(s) applied
- **attendanceRoutes**: 1 middleware(s) applied
- **authRoutes**: 0 middleware(s) applied
- **classRoutes**: 1 middleware(s) applied
- **courseRoutes**: 1 middleware(s) applied
- **dashboardRoutes**: 1 middleware(s) applied
- **departmentRoutes**: 1 middleware(s) applied
- **disciplineRoutes**: 1 middleware(s) applied
- **divisionRoutes**: 1 middleware(s) applied
- **facultyRoutes**: 1 middleware(s) applied
- **programRoutes**: 1 middleware(s) applied
- **submissionRoutes**: 1 middleware(s) applied
- **userRoutes**: 1 middleware(s) applied

