# Logic Consistency Report

> **Note**: This report is automatically generated.
> Last updated: 2026-01-08T15:56:07.351Z

## Overview

This document tracks consistency checks for the backend logic.

## Model Relationships

The following relationships are defined:

- **Class** references: Department, Division, Program
- **Course** references: Department, Division, Program, User
- **Department** references: Faculty, User
- **Division** references: Department
- **Program** references: Division
- **User** references: Program, Class, Department

## Controller Coverage

Each controller should have corresponding routes:

- **authController**: 1 functions, 1 documented routes
- **classController**: 5 functions, 5 documented routes
- **courseController**: 5 functions, 5 documented routes
- **dashboardController**: 1 functions, 1 documented routes
- **departmentController**: 3 functions, 3 documented routes
- **divisionController**: 3 functions, 3 documented routes
- **facultyController**: 3 functions, 3 documented routes
- **programController**: 5 functions, 5 documented routes
- **userController**: 6 functions, 5 documented routes

## Middleware Usage

- **authRoutes**: 0 middleware(s) applied
- **classRoutes**: 1 middleware(s) applied
- **courseRoutes**: 1 middleware(s) applied
- **dashboardRoutes**: 1 middleware(s) applied
- **departmentRoutes**: 1 middleware(s) applied
- **divisionRoutes**: 1 middleware(s) applied
- **facultyRoutes**: 1 middleware(s) applied
- **programRoutes**: 1 middleware(s) applied
- **userRoutes**: 1 middleware(s) applied

