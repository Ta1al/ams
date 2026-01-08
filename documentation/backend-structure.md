# Backend Structure

> **Note**: This documentation is automatically generated from the backend code.
> Last updated: 2026-01-08T17:24:15.565Z

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

### Course

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| code | String |
| department | ObjectId |
| discipline | ObjectId |
| program | ObjectId |
| teacher | ObjectId |

**References:**
- Department
- Discipline
- Program
- User

### Department

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| headOfDepartment | ObjectId |

**References:**
- User

### Discipline

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| program | ObjectId |

**References:**
- Program

### Program

**Fields:**

| Field | Type |
|-------|------|
| name | String |
| level | String |
| department | ObjectId |

**References:**
- Department

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

- **Models**: 6
- **Controllers**: 8
- **Routes**: 8
- **Middleware**: 1

