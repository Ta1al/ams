# Data Models & Hierarchy

This document illustrates the data hierarchy and relationships within the Attendance Management System.

## Hierarchy Overview

The academic structure is organized as follows:
1.  **Faculty**: The highest organizational unit (e.g., Faculty of Computing).
2.  **Department**: Belong to a Faculty (e.g., Department of CS).
3.  **Discipline**: Specialized academic units within a Department (e.g., Software Engineering).
4.  **Program**: Academic degrees offered by a Discipline (e.g., BS Software Engineering).

5.  **Users**:
    *   **Students** are enrolled in a **Program**.
    *   **Teachers** belong to a **Department**.
    *   **Admins** oversee the system.

## Course

`Course` represents a section-specific course offering: the same course code/name can exist multiple times across different class sections and/or teachers.

Fields:

- `name` (required)
- `code` (optional)
- `department` (required, ref `Department`)
- `discipline` (required, ref `Discipline`)
- `program` (required, ref `Program`)
- `class` (required, ref `Class`) — batch the course is offered to
- `teacher` (required, ref `User`)

Uniqueness:

- If `code` is set, the backend enforces uniqueness per offering as `(class, code, teacher)`.

Consistency rules enforced on create/update (backend):

- `discipline.department` must match the selected `department`.
- `program.discipline` must match the selected `discipline`.
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

    class Faculty {
        +ObjectId _id
        +String name
    }

    class Department {
        +ObjectId _id
        +String name
        +ObjectId faculty
        +ObjectId headOfDepartment
    }

    class Program {
        +ObjectId _id
        +String name
        +String level
        +ObjectId discipline
        +ObjectId department
    }

    class Discipline {
        +ObjectId _id
        +String name
        +ObjectId department
    }

    class Course {
        +ObjectId _id
        +String name
        +String code
        +ObjectId department
        +ObjectId discipline
        +ObjectId program
        +ObjectId class
        +ObjectId teacher
    }

    %% Hierarchy Relationships
    Faculty "1" --> "*" Department : contains
    Department "1" --> "*" Discipline : contains
    Discipline "1" --> "*" Program : offers

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
    FACULTY ||--|{ DEPARTMENT : contains
    DEPARTMENT ||--|{ DISCIPLINE : contains
    DISCIPLINE ||--|{ PROGRAM : offers

    DEPARTMENT ||--|{ COURSE : offers
    DISCIPLINE ||--|{ COURSE : offers
    PROGRAM ||--|{ COURSE : offers
    USER ||--|{ COURSE : teaches
    
    USER ||--o| PROGRAM : "enrolled in (Student)"
    USER ||--o| DEPARTMENT : "works in (Teacher)"
    
    DEPARTMENT |o--|| USER : "head is"

    FACULTY {
        ObjectId _id
        String name
    }

    DEPARTMENT {
        ObjectId _id
        String name
        ObjectId faculty
        ObjectId headOfDepartment
    }

    DISCIPLINE {
        ObjectId _id
        String name
        ObjectId department
    }

    PROGRAM {
        ObjectId _id
        String name
        String level
        ObjectId discipline
        ObjectId department
    }

    COURSE {
        ObjectId _id
        String name
        String code
        ObjectId department
        ObjectId discipline
        ObjectId program
        ObjectId class
        ObjectId teacher
    }

    USER {
        ObjectId _id
        String name
        String username
        String role
    }
```
