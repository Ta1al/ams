# Data Models & Hierarchy

This document illustrates the data hierarchy and relationships within the Attendance Management System.

## Hierarchy Overview

The academic structure is organized as follows:
1.  **Faculty**: The highest organizational unit (e.g., Faculty of Computing).
2.  **Department**: Belong to a Faculty (e.g., Department of CS).
3.  **Division**: Specialized units within a Department (e.g., AI Division).
4.  **Program**: Academic degrees offered by a Division (e.g., BS AI).

5.  **Users**:
    *   **Students** are enrolled in a **Program**.
    *   **Teachers** belong to a **Department**.
    *   **Admins** oversee the system.

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

    class Division {
        +ObjectId _id
        +String name
        +ObjectId department
    }

    class Program {
        +ObjectId _id
        +String name
        +String level
        +ObjectId division
    }

    %% Hierarchy Relationships
    Faculty "1" --> "*" Department : contains
    Department "1" --> "*" Division : contains
    Division "1" --> "*" Program : offers

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
    DEPARTMENT ||--|{ DIVISION : contains
    DIVISION ||--|{ PROGRAM : offers
    
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

    DIVISION {
        ObjectId _id
        String name
        ObjectId department
    }

    PROGRAM {
        ObjectId _id
        String name
        String level
        ObjectId division
    }

    USER {
        ObjectId _id
        String name
        String username
        String role
    }
```
