# Documentation

This directory contains comprehensive documentation for the Attendance Management System (AMS) backend.

## Automated Documentation

Most files in this directory are **automatically generated** by the GitHub Actions workflow defined in `.github/workflows/logic-verification.yml`. The workflow runs on every push that modifies backend files and keeps the documentation in sync with the codebase.

## Files

### Auto-Generated Files

These files are automatically updated by the CI/CD workflow:

- **[api-reference.md](api-reference.md)**: Complete reference of all API endpoints, organized by controller and route file. Includes HTTP methods, paths, handler functions, and middleware usage.

- **[backend-structure.md](backend-structure.md)**: Overview of the backend architecture following the MVC pattern. Documents all data models with their fields, types, and relationships.

- **[logic-consistency.md](logic-consistency.md)**: Automated consistency checks including model relationships, controller coverage, and middleware usage patterns.

### Manually Maintained Files

These files are manually created and maintained:

- **[auth-and-rbac.md](auth-and-rbac.md)**: Detailed documentation of authentication using JWT and Role-Based Access Control (RBAC) implementation. Includes sequence diagrams and examples.

- **[models.md](models.md)**: Entity relationship diagrams showing the hierarchical data structure from Faculty → Department → Discipline → Program, and user relationships.

## How Automated Documentation Works

1. **Trigger**: The workflow runs automatically when:
   - Files in `backend/` are modified
   - The workflow file itself is updated

2. **Analysis**: The workflow analyzes:
   - All Mongoose models and their schemas
   - All controller functions and their routes
   - All route definitions and HTTP methods
   - All middleware and their functions
   - Relationships between models

3. **Generation**: Based on the analysis, it generates:
   - Comprehensive API endpoint documentation
   - Data model structure with field types
   - Consistency reports showing relationships

4. **Commit**: If changes are detected, the workflow automatically commits the updated documentation with the message: `docs: Auto-update documentation from backend changes [skip ci]`

## Viewing Documentation

All documentation files are in Markdown format and can be viewed:
- Directly in GitHub's web interface
- In any Markdown viewer/editor
- In your IDE with Markdown preview

## Contributing

When making changes to the backend:
- **Controllers, Routes, Models**: Documentation will be automatically updated
- **Auth/RBAC or Models diagrams**: Update the respective manual files
- Always review the auto-generated documentation after backend changes to ensure accuracy

## Notes

- The auto-generated documentation reflects the actual code structure, not intended behavior
- If you notice inconsistencies, they may indicate issues in the code itself
- The `[skip ci]` tag in auto-commit messages prevents infinite workflow loops
