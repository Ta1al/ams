# Architecture Diagrams

> **Note**: This document contains Mermaid diagrams showing the system architecture and logic flow.
> Last updated: ${new Date().toISOString()}

## System Architecture

```mermaid
graph TB
    subgraph "Frontend - React + Vite"
        UI[User Interface]
        Auth[AuthContext]
        Routes[React Router]
        Pages[Pages/Components]
        API[API Calls<br/>fetch]
    end

    subgraph "Backend - Node.js + Express"
        Server[Express Server]
        AuthMW[Auth Middleware]
        Controllers[Controllers]
        Models[Mongoose Models]
        DB[(MongoDB)]
    end

    UI --> Auth
    Auth --> Routes
    Routes --> Pages
    Pages --> API
    
    API -->|HTTP/JSON| Server
    Server --> AuthMW
    AuthMW --> Controllers
    Controllers --> Models
    Models --> DB

    style UI fill:#e1f5ff
    style Server fill:#fff4e1
    style DB fill:#e8f5e9
    style Auth fill:#f3e5f5
    style AuthMW fill:#f3e5f5
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Login Page
    participant AuthContext
    participant Backend API
    participant JWT Middleware
    participant Database

    User->>Login Page: Enter credentials
    Login Page->>Backend API: POST /api/auth/login
    Backend API->>Database: Find user by username
    Database-->>Backend API: User data
    Backend API->>Backend API: Verify password (bcrypt)
    alt Valid credentials
        Backend API->>Backend API: Generate JWT token
        Backend API-->>Login Page: User data + token
        Login Page->>AuthContext: login(userData)
        AuthContext->>AuthContext: Store in localStorage
        AuthContext-->>User: Redirect to dashboard
    else Invalid credentials
        Backend API-->>Login Page: 401 Invalid credentials
        Login Page-->>User: Show error message
    end
```

## Protected Route Flow

```mermaid
sequenceDiagram
    participant User
    participant ProtectedRoute
    participant AuthContext
    participant Backend API
    participant Auth Middleware

    User->>ProtectedRoute: Navigate to protected page
    ProtectedRoute->>AuthContext: Check isAuthenticated
    alt Not authenticated
        AuthContext-->>ProtectedRoute: false
        ProtectedRoute-->>User: Redirect to /login
    else Authenticated
        AuthContext-->>ProtectedRoute: true + user role
        ProtectedRoute->>ProtectedRoute: Check allowedRoles
        alt Role not allowed
            ProtectedRoute-->>User: Redirect to /dashboard
        else Role allowed
            ProtectedRoute-->>User: Render page
            User->>Backend API: API request + Bearer token
            Backend API->>Auth Middleware: Verify token
            Auth Middleware->>Auth Middleware: Decode JWT
            alt Invalid token
                Auth Middleware-->>Backend API: 401
                Backend API-->>User: Unauthorized
            else Valid token
                Auth Middleware->>Auth Middleware: Load user from DB
                Auth Middleware-->>Backend API: req.user set
                Backend API-->>User: Response data
            end
        end
    end
```

## Role-Based Access Control (RBAC)

```mermaid
graph TD
    Start[User Request] --> Auth{Authenticated?}
    Auth -->|No| Login[Redirect to Login]
    Auth -->|Yes| Role{Check Role}
    
    Role -->|Admin| AdminAccess[Full Access]
    Role -->|Teacher| TeacherAccess[Teacher Access]
    Role -->|Student| StudentAccess[Student Access]
    
    AdminAccess --> AdminRoutes["/admin/*<br/>User Management<br/>Program Management<br/>All CRUD Operations"]
    
    TeacherAccess --> TeacherRoutes["/teacher/*<br/>Student List<br/>Attendance Management<br/>Course Access"]
    
    StudentAccess --> StudentRoutes["/student/*<br/>View Attendance<br/>View Courses<br/>Read-only Access"]
    
    AdminRoutes --> Backend[Backend API]
    TeacherRoutes --> Backend
    StudentRoutes --> Backend
    
    Backend --> Middleware{Middleware Check}
    Middleware -->|protect| JWT[Verify JWT]
    JWT -->|Invalid| Error401[401 Unauthorized]
    JWT -->|Valid| RoleCheck{Role Check}
    RoleCheck -->|adminOnly| AdminCheck{Is Admin?}
    AdminCheck -->|No| Error403[403 Forbidden]
    AdminCheck -->|Yes| Process[Process Request]
    RoleCheck -->|No role check| Process
    Process --> Response[Send Response]

    style Start fill:#e3f2fd
    style Login fill:#ffebee
    style Error401 fill:#ffcdd2
    style Error403 fill:#ffcdd2
    style Response fill:#c8e6c9
```

## Data Flow: User Management

```mermaid
sequenceDiagram
    participant Admin UI
    participant Frontend
    participant Express
    participant protect
    participant adminOnly
    participant userController
    participant User Model
    participant MongoDB

    Admin UI->>Frontend: Create new user
    Frontend->>Express: POST /api/users<br/>Authorization: Bearer {token}
    Express->>protect: Verify authentication
    protect->>protect: Decode JWT
    protect->>User Model: Find user by ID
    User Model->>MongoDB: Query user
    MongoDB-->>protect: User data
    protect->>Express: req.user = user
    Express->>adminOnly: Check authorization
    adminOnly->>adminOnly: Check if role == 'admin'
    alt Not admin
        adminOnly-->>Frontend: 403 Forbidden
        Frontend-->>Admin UI: Show error
    else Is admin
        adminOnly->>userController: createUser()
        userController->>userController: Validate input
        userController->>userController: Hash password
        userController->>User Model: Save new user
        User Model->>MongoDB: Insert document
        MongoDB-->>userController: Created user
        userController-->>Frontend: 201 Created
        Frontend-->>Admin UI: Update UI
    end
```

## Data Hierarchy

```mermaid
graph TD
    Faculty[Faculty] --> Department[Department]
    Department --> Division[Division]
    Division --> Program[Program]
    Program --> Student[Student User]
    Department --> Teacher[Teacher User]
    
    Program --> Course[Course]
    Teacher --> Course
    Course --> Attendance[Attendance Records]
    Student --> Attendance

    style Faculty fill:#e1bee7
    style Department fill:#ce93d8
    style Division fill:#ba68c8
    style Program fill:#ab47bc
    style Student fill:#81c784
    style Teacher fill:#64b5f6
    style Course fill:#fff176
    style Attendance fill:#ffb74d
```

## API Endpoint Coverage

```mermaid
graph LR
    subgraph "Public Endpoints"
        Auth[POST /api/auth/login]
    end

    subgraph "Admin Only Endpoints"
        UserCRUD["/api/users<br/>GET, POST, PUT, DELETE"]
        FacultyCRUD["/api/faculties<br/>POST, DELETE"]
        DeptCRUD["/api/departments<br/>POST, PUT, DELETE"]
        DivCRUD["/api/divisions<br/>POST, PUT, DELETE"]
        ProgCRUD["/api/programs<br/>POST, PUT, DELETE"]
        CourseCRUD["/api/courses<br/>POST, PUT, DELETE"]
    end

    subgraph "Protected Endpoints (All Roles)"
        FacultyList["/api/faculties<br/>GET"]
        DeptList["/api/departments<br/>GET"]
        DivList["/api/divisions<br/>GET"]
        ProgList["/api/programs<br/>GET"]
        CourseList["/api/courses<br/>GET (filtered by role)"]
        Dashboard["/api/dashboard<br/>GET (role-specific)"]
    end

    Auth --> Public[No Auth Required]
    UserCRUD --> AdminRole[Requires Admin Role]
    FacultyCRUD --> AdminRole
    DeptCRUD --> AdminRole
    DivCRUD --> AdminRole
    ProgCRUD --> AdminRole
    CourseCRUD --> AdminRole
    
    FacultyList --> AnyAuth[Requires Authentication]
    DeptList --> AnyAuth
    DivList --> AnyAuth
    ProgList --> AnyAuth
    CourseList --> AnyAuth
    Dashboard --> AnyAuth

    style Auth fill:#81c784
    style AdminRole fill:#e57373
    style AnyAuth fill:#64b5f6
```

## Frontend-Backend Integration

```mermaid
graph TB
    subgraph "Frontend Routes"
        LoginRoute["/login"]
        DashRoute["/dashboard"]
        AdminUsers["/admin/users"]
        AdminProgs["/admin/programs"]
        TeacherStud["/teacher/students"]
        TeacherAtt["/teacher/attendance"]
        StudentAtt["/student/attendance"]
    end

    subgraph "Frontend Components"
        UsersPage[UsersPage.jsx]
        ProgsPage[ProgramsPage.jsx]
        StudPage[StudentsPage.jsx]
        TeachAttPage[AttendancePage.jsx]
        StudAttPage[MyAttendancePage.jsx]
    end

    subgraph "API Endpoints"
        AuthAPI[POST /api/auth/login]
        UsersAPI[/api/users<br/>GET, POST, PUT, DELETE]
        ProgsAPI[/api/programs<br/>GET, POST, PUT, DELETE]
        CoursesAPI[/api/courses<br/>GET, POST, PUT, DELETE]
        DashAPI[GET /api/dashboard]
    end

    LoginRoute --> AuthAPI
    DashRoute --> DashAPI
    
    AdminUsers --> UsersPage
    UsersPage -->|fetch| UsersAPI
    
    AdminProgs --> ProgsPage
    ProgsPage -->|fetch| ProgsAPI
    
    TeacherStud --> StudPage
    StudPage -->|fetch| UsersAPI
    StudPage -->|fetch| ProgsAPI
    
    TeacherAtt --> TeachAttPage
    TeachAttPage -->|fetch| CoursesAPI
    
    StudentAtt --> StudAttPage
    StudAttPage -->|fetch| CoursesAPI

    style LoginRoute fill:#81c784
    style AdminUsers fill:#e57373
    style AdminProgs fill:#e57373
    style TeacherStud fill:#64b5f6
    style TeacherAtt fill:#64b5f6
    style StudentAtt fill:#ba68c8
```

## Error Handling Flow

```mermaid
flowchart TD
    Request[API Request] --> HasToken{Has Bearer Token?}
    HasToken -->|No| E401A[401 Unauthorized]
    HasToken -->|Yes| ValidToken{Valid JWT?}
    ValidToken -->|No| E401B[401 Invalid Token]
    ValidToken -->|Yes| UserExists{User in DB?}
    UserExists -->|No| E401C[401 User Not Found]
    UserExists -->|Yes| NeedRole{Requires Role Check?}
    NeedRole -->|No| Handler[Route Handler]
    NeedRole -->|Yes| HasRole{Has Required Role?}
    HasRole -->|No| E403[403 Forbidden]
    HasRole -->|Yes| Handler
    Handler --> Process{Processing}
    Process -->|Validation Error| E400[400 Bad Request]
    Process -->|Not Found| E404[404 Not Found]
    Process -->|Server Error| E500[500 Internal Error]
    Process -->|Success| S200[200/201 Success]

    style E401A fill:#ffcdd2
    style E401B fill:#ffcdd2
    style E401C fill:#ffcdd2
    style E403 fill:#ffcdd2
    style E400 fill:#ffe0b2
    style E404 fill:#ffe0b2
    style E500 fill:#ffcdd2
    style S200 fill:#c8e6c9
```
