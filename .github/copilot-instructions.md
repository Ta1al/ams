# Copilot Instructions for AMS (Attendance Management System)

## Project Overview
This represents a MERN stack application organized in a simple monorepo structure.

## Architecture & Structure
- **Root**: Contains README and project documentation.
- **Backend (`backend/`)**: Node.js/Express REST API.
  - Entry point: `server.js`
  - DB Connection: `config/db.js`
  - **Standard Structure**: Follow the standard `models/` (Mongoose schemas), `controllers/` (logic), and `routes/` (endpoints) pattern for new features.
  - Uses Mongoose for MongoDB interactions.
- **Frontend (`frontend/`)**: React application built with Vite.
  - Entry point: `src/main.jsx`
  - Routing: `src/App.jsx` (React Router v7)
  - Styling: Tailwind CSS v4 + DaisyUI v5.

## Tech Stack & Versions
- **Runtime**: Node.js
- **Frontend**:
  - React 19
  - Vite 7
  - Tailwind CSS 4
  - DaisyUI 5
  - React Router DOM 7
- **Backend**:
  - Express 5.x (Alpha)
  - Mongoose 9.x
  - Dotenv, Cors

## Coding Conventions

### Frontend (React)
- **Components**: Use Functional Components with Hooks.
- **Styling**: Prefer Tailwind utility classes and DaisyUI component classes (e.g., `btn btn-primary`, `card`, `input-bordered`) over custom CSS.
- **State Management**: Use `useState` and `useEffect` for local state.
- **Routing**: Use `react-router-dom` components (`BrowserRouter`, `Routes`, `Route`).
- **Icons**: Use `lucide-react`.

### Backend (Node/Express)
- **Folder Structure**: Organize code into `routes`, `controllers`, and `models`. Avoid putting business logic directly in `server.js`.
- **ES Modules**: Backend currently uses CommonJS (`require`). Maintain this unless migrated to ESM.
- **Async/Await**: Always use `async/await` for database operations and asynchronous logic.
- **Error Handling**: Use try/catch blocks in async route handlers. Return standard HTTP status codes (200, 400, 500).
- **Environment**: Access config via `process.env`.

## Developer Workflow
- **Frontend Development**: Run `npm run dev` in `frontend/` directory (Vite).
- **Backend Development**: Run `npm run dev` in `backend/` directory (Nodemon).
- **Dependencies**: Install dependencies separately in `frontend/` and `backend/`.

## Common Patterns
- **Forms**: Prevent default submission `e.preventDefault()` and handle state via controlled inputs.
- **API calls**: (Future) Centralize API calls or use a service layer. Ensure JSON responses.

## Business Logic & Authentication Rules
- **Registration**: NO public self-registration for any role.
  - **Students/Teachers**: Accounts are created solely by Admins via an internal dashboard.
  - **Admins**: The initial Admin account must be created via a database seed script (bootstrapping).
- **Access Control**: Strict Role-Based Access Control (RBAC).
  - Admin: Full access (User management, Class assignment).
  - Teacher: Class management, Attendance marking.
  - Student: View-only access for personal attendance.
