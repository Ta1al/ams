# Attendance Management System

## Project Structure

- `backend/`: Node.js/Express server
- `frontend/`: React + Vite application
- `documentation/`: Auto-generated API and backend documentation
- `.github/workflows/`: CI/CD workflows for automated testing and documentation

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `example.env` to a new file named `.env`.
   - Update the values in `.env` as needed (e.g., MongoDB URI, JWT Secret).

4. Start the server:
   - For development (with auto-reload):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Automated Documentation

This project includes automated full-stack logic verification and documentation generation through GitHub Actions.

### Logic Verification Workflow

The workflow automatically runs on every push to the repository when backend or frontend files are modified. It performs the following tasks:

1. **Backend Structure Analysis**: Scans all backend code to extract:
   - Data models and their relationships
   - Controllers and their functions
   - API routes and endpoints
   - Middleware components

2. **Frontend Structure Analysis**: Scans all frontend code to extract:
   - React components and pages
   - Route definitions and access control
   - API calls and their endpoints
   - Authentication and authorization checks

3. **Cross-Verification**: Validates consistency between frontend and backend:
   - Ensures frontend API calls map to existing backend endpoints
   - Verifies role-based access control consistency
   - Detects orphaned or unused endpoints
   - Identifies authentication logic mismatches

4. **Documentation Generation**: Automatically generates and updates:
   - `documentation/api-reference.md`: Complete API endpoint reference
   - `documentation/backend-structure.md`: Backend architecture and data models
   - `documentation/frontend-structure.md`: Frontend architecture and routing
   - `documentation/logic-consistency.md`: Full-stack consistency checks and integration points
   - `documentation/architecture-diagrams.md`: Mermaid diagrams showing system architecture

5. **Issue Creation**: When inconsistencies are detected:
   - Creates or updates a GitHub issue with detailed information
   - Tags with appropriate labels for easy tracking
   - Provides actionable recommendations for fixes

6. **Auto-Commit**: If documentation changes are detected, they are automatically committed back to the repository

### Documentation Files

- **[API Reference](documentation/api-reference.md)**: Comprehensive list of all API endpoints organized by controller
- **[Backend Structure](documentation/backend-structure.md)**: Overview of data models, relationships, and MVC architecture
- **[Frontend Structure](documentation/frontend-structure.md)**: React components, routes, and API integration
- **[Logic Consistency Report](documentation/logic-consistency.md)**: Full-stack consistency checks and integration analysis
- **[Architecture Diagrams](documentation/architecture-diagrams.md)**: Mermaid diagrams showing system architecture, authentication flow, RBAC, and data flow
- **[Authentication & RBAC](documentation/auth-and-rbac.md)**: Authentication and authorization documentation
- **[Data Models](documentation/models.md)**: Entity relationship diagrams and model hierarchy

The documentation is automatically kept in sync with the codebase, ensuring it always reflects the current state of both frontend and backend.
