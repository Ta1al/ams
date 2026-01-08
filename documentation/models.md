# Data Models & Hierarchy

This document illustrates the data hierarchy and relationships within the Attendance Management System.

## Hierarchy Overview

The academic structure is organized as follows:
1.  **Department**: An academic department (e.g., Department of Computer Science).
2.  **Program**: A degree program offered by a Department (e.g., BS, MS/MPhil/MBA, PhD, Diploma).
3.  **Discipline**: A specialization/track under a Program (e.g., Data Science, Artificial Intelligence).

5.  **Users**:
    *   **Students** are enrolled in a **Program**.
    *   **Teachers** belong to a **Department**.
    *   **Admins** oversee the system.

## Course

`Course` links an academic offering to the hierarchy and assigns a teacher.

Fields:

- `name` (required)
- `code` (optional)
- `department` (required, ref `Department`)
- `discipline` (required, ref `Discipline`)
- `program` (required, ref `Program`)
- `teacher` (required, ref `User`)

Consistency rules enforced on create/update (backend):

- `program.department` must match the selected `department`.
- `discipline.program` must match the selected `program`.
- `teacher.role` must be `teacher`.
- If the selected teacher has `department` set, it must match the selected `department`.

## Entity Relationship Diagrams

### Class Diagram

```mermaid
classDiagram
    direction TB

    class User {
        +ObjectId _id
        +String name
        +String username
        +String password
        +String role
        +ObjectId program
        +ObjectId department
    }

    class Department {
        +ObjectId _id
        +String name
        +ObjectId headOfDepartment
    }

    class Program {
        +ObjectId _id
        +String name
        +String level
        +ObjectId department
    }

    class Discipline {
        +ObjectId _id
        +String name
        +ObjectId program
    }

    class Course {
        +ObjectId _id
        +String name
        +String code
        +ObjectId department
        +ObjectId discipline
        +ObjectId program
        +ObjectId teacher
    }

    %% Hierarchy Relationships
    Department "1" --> "*" Program : offers
    Program "1" --> "*" Discipline : contains

    %% Course Relationships
    Department "1" --> "*" Course : offers
    Discipline "1" --> "*" Course : offers
    Program "1" --> "*" Course : offers
    User "1" --> "*" Course : teaches

    %% User Relationships
    User "*" --> "0..1" Program : enrolled (Student)
    User "*" --> "0..1" Department : works in (Teacher)
    
    %% Management Relationships
    Department "0..1" --> "1" User : headOfDepartment
```

### ER Diagram

```mermaid
erDiagram
    DEPARTMENT ||--|{ PROGRAM : offers
    PROGRAM ||--|{ DISCIPLINE : contains

    DEPARTMENT ||--|{ COURSE : offers
    DISCIPLINE ||--|{ COURSE : offers
    PROGRAM ||--|{ COURSE : offers
    USER ||--|{ COURSE : teaches
    
    USER ||--o| PROGRAM : "enrolled in (Student)"
    USER ||--o| DEPARTMENT : "works in (Teacher)"
    
    DEPARTMENT |o--|| USER : "head is"

    DEPARTMENT {
        ObjectId _id
        String name
        ObjectId headOfDepartment
    }

    DISCIPLINE {
        ObjectId _id
        String name
        ObjectId program
    }

    PROGRAM {
        ObjectId _id
        String name
        String level
        ObjectId department
    }

    COURSE {
        ObjectId _id
        String name
        String code
        ObjectId department
        ObjectId discipline
        ObjectId program
        ObjectId teacher
    }

    USER {
        ObjectId _id
        String name
        String username
        String role
    }
```
