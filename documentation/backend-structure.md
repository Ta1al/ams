# Backend Structure

> **Note**: This documentation is automatically generated from the backend code.
> Last updated: 2026-01-07T16:51:50.049Z

## Architecture Overview

The backend follows the **MVC (Model-View-Controller)** pattern with the following structure:

```
backend/
├── models/          # Mongoose schemas and data models
├── controllers/     # Business logic and request handlers
├── routes/          # API endpoint definitions
├── middleware/      # Authentication, authorization, and other middleware
├── config/          # Configuration files (DB connection, etc.)
└── server.js        # Application entry point
```

## Data Models

### Course

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| code | String |
| department | ObjectId |
| division | ObjectId |
| program | ObjectId |
| teacher | ObjectId |

**References:**
- Department
- Division
- Program
- User

### Department

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| faculty | ObjectId |
| headOfDepartment | ObjectId |

**References:**
- Faculty
- User

### Division

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| department | ObjectId |

**References:**
- Department

### Faculty

**Fields:**

| Field | Type |
|-------|------|
| name | String |

### Program

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| level | String |
| division | ObjectId |

**References:**
- Division

### User

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| username | String |
| password | String |
| role | String |
| program | ObjectId |
| department | ObjectId |

**References:**
- Program
- Department

## Data Hierarchy

The system follows this organizational hierarchy:

```
Faculty
  └── Department
        └── Division
              └── Program
                    └── Student (User)

Department
  └── Teacher (User)
```

## Component Statistics

- **Models**: 6
- **Controllers**: 8
- **Routes**: 8
- **Middleware**: 1

