# Backend Structure

> **Note**: This documentation is automatically generated from the backend code.
> Last updated: 2026-01-15T16:53:16.901Z

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

### Assignment

**Fields:**

| Field | Type |
|-------|------|
| uploadedAt | Date |

### Attendance

**Fields:**

| Field | Type |
|-------|------|
| student | ObjectId |
| status | String |
| remarks | String |

**References:**
- User

### Class

**Fields:**

| Field | Type |
|-------|------|
| department | ObjectId |
| discipline | ObjectId |
| program | ObjectId |
| session | Number |
| endYear | Number |
| section | String |

**References:**
- Department
- Discipline
- Program

### ClassSession

**Fields:**

| Field | Type |
|-------|------|
| course | ObjectId |
| room | String |
| startTime | Date |
| endTime | Date |
| recurrence | String |
| interval | Number |
| count | Number |
| until | Date |
| status | String |
| createdBy | ObjectId |
| updatedBy | ObjectId |
| rescheduleReason | String |
| cancelledReason | String |

**References:**
- Course
- User
- User

### Course

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| code | String |
| department | ObjectId |
| discipline | ObjectId |
| program | ObjectId |
| class | ObjectId |
| teacher | ObjectId |

**References:**
- Department
- Discipline
- Program
- Class
- User
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

### Discipline

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| department | ObjectId |

**References:**
- Department

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
| level | String |
| discipline | ObjectId |
| department | ObjectId |

**References:**
- Discipline
- Department

### Submission

**Fields:**

| Field | Type |
|-------|------|
| uploadedAt | Date |

### User

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| username | String |
| password | String |
| role | String |
| program | ObjectId |
| class | ObjectId |
| department | ObjectId |

**References:**
- Program
- Class
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

- **Models**: 12
- **Controllers**: 14
- **Routes**: 14
- **Middleware**: 1

