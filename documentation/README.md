# Documentation

This directory contains comprehensive documentation for the Attendance Management System (AMS) covering both backend and frontend.

## Automated Documentation

Most files in this directory are **automatically generated** by the GitHub Actions workflow defined in `.github/workflows/logic-verification.yml`. The workflow runs on every push that modifies backend or frontend files and keeps the documentation in sync with the codebase.

## Files

### Auto-Generated Files

These files are automatically updated by the CI/CD workflow:

- **[api-reference.md](api-reference.md)**: Complete reference of all API endpoints, organized by controller and route file. Includes HTTP methods, paths, handler functions, and middleware usage.

- **[backend-structure.md](backend-structure.md)**: Overview of the backend architecture following the MVC pattern. Documents all data models with their fields, types, and relationships.

- **[frontend-structure.md](frontend-structure.md)**: Overview of the frontend architecture using React. Documents all pages, components, routes, and API integration points.

- **[logic-consistency.md](logic-consistency.md)**: Full-stack consistency checks including model relationships, controller coverage, frontend-backend integration, and role-based access control verification.

### Manually Maintained Files

These files are manually created and maintained:

- **[architecture-diagrams.md](architecture-diagrams.md)**: Comprehensive Mermaid diagrams showing system architecture, authentication flow, RBAC, data flow, and frontend-backend integration.

- **[auth-and-rbac.md](auth-and-rbac.md)**: Detailed documentation of authentication using JWT and Role-Based Access Control (RBAC) implementation. Includes sequence diagrams and examples.

- **[models.md](models.md)**: Entity relationship diagrams showing the hierarchical data structure from Faculty → Department → Division → Program, and user relationships.

## How Automated Documentation Works

1. **Trigger**: The workflow runs automatically when:
   - Files in `backend/` are modified
   - Files in `frontend/` are modified
   - The workflow file itself is updated

2. **Backend Analysis**: The workflow analyzes:
   - All Mongoose models and their schemas
   - All controller functions and their routes
   - All route definitions and HTTP methods
   - All middleware and their functions
   - Relationships between models

3. **Frontend Analysis**: The workflow analyzes:
   - All React components and pages
   - All route definitions with their access control
   - All API calls (fetch) and their endpoints
   - Authentication and authorization patterns

4. **Cross-Verification**: The workflow checks:
   - Frontend API calls map to backend endpoints
   - Role-based access control consistency
   - Unused endpoints detection
   - Authentication logic synchronization

5. **Generation**: Based on the analysis, it generates:
   - Comprehensive API endpoint documentation
   - Data model structure with field types
   - Frontend structure and routing documentation
   - Consistency reports showing relationships and issues

6. **Issue Creation**: If inconsistencies are found:
   - Creates or updates a GitHub issue
   - Tags with appropriate labels
   - Provides detailed information and recommendations

7. **Commit**: If changes are detected, the workflow automatically commits the updated documentation with the message: `docs: Auto-update documentation from code changes [skip ci]`

## Viewing Documentation

All documentation files are in Markdown format and can be viewed:
- Directly in GitHub's web interface
- In any Markdown viewer/editor
- In your IDE with Markdown preview

## Architecture Diagrams

The `architecture-diagrams.md` file contains Mermaid diagrams that visualize:
- System architecture (Frontend ↔ Backend ↔ Database)
- Authentication and authorization flow
- Role-based access control
- Data hierarchy and relationships
- API endpoint coverage
- Frontend-backend integration
- Error handling flow

## Contributing

When making changes to the codebase:
- **Backend Changes (Controllers, Routes, Models)**: Documentation will be automatically updated
- **Frontend Changes (Components, Pages, Routes)**: Documentation will be automatically updated
- **Architecture or Auth Changes**: Update the respective manual files with diagrams
- Always review the auto-generated documentation after changes to ensure accuracy

## Consistency Checks

The automated workflow performs several consistency checks:

1. **Endpoint Matching**: Ensures frontend API calls correspond to backend endpoints
2. **Role Verification**: Checks that roles used in frontend match backend roles
3. **Unused Endpoints**: Identifies backend endpoints not used by frontend
4. **Missing Endpoints**: Detects frontend calls to non-existent endpoints

If issues are found, they will be reported in:
- The `logic-consistency.md` file
- A GitHub issue (created/updated automatically)
- The workflow summary

## Notes

- The auto-generated documentation reflects the actual code structure, not intended behavior
- If you notice inconsistencies, they may indicate issues in the code itself
- The `[skip ci]` tag in auto-commit messages prevents infinite workflow loops
- Documentation updates happen automatically within minutes of code changes
