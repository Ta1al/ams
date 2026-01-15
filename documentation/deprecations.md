# Deprecations

This file tracks endpoints that exist in the backend but are not used by the current frontend (`frontend/src/**`) or backend smoke scripts (`backend/scripts/**`).

**Policy**
- Deprecation comes before deletion.
- Deprecated endpoints remain functional for now.
- After a grace period (or once confirmed unused), we can remove routes/controllers and unmount them from `backend/server.js`.

## Candidates (January 2026)

### `/api/faculties`

- **Mounted**: Yes (`backend/server.js`)
- **Frontend usage**: Not referenced anywhere in `frontend/src/**`
- **Scripts usage**: Not referenced in `backend/scripts/**`
- **Notes**: Likely safe to deprecate if your UI doesn’t expose faculty management yet.

### `/api/divisions`

- **Mounted**: Yes (`backend/server.js`)
- **Frontend usage**: Not referenced anywhere in `frontend/src/**`
- **Scripts usage**: Not referenced in `backend/scripts/**`
- **Notes**: Your app primarily uses `Discipline` in the admin pages (`/api/disciplines`). Having both `Division` and `Discipline` is a source of confusion. Recommend deprecating `Division` routes unless you truly need both concepts.

## Known confusing overlaps (not removed)

### `Division` vs `Discipline`
- Several controllers accept either `division` or `discipline` fields.
- Consider standardizing on **one** name (prefer `Discipline`, since it is used by the admin UI).

