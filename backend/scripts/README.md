# Backend smoke scripts

These scripts hit your running backend API to validate core flows.

## Requirements
- Node.js 18+ (uses global `fetch`)
- Backend running (e.g. `npm run dev` in `backend/`)
- Seeded admin account

## Enrollment smoke test
PowerShell:

```powershell
cd c:\Users\Talal\coding\ams\backend
$env:BASE_URL='http://localhost:5000'
$env:ADMIN_USERNAME='admin'
$env:ADMIN_PASSWORD='admin123'
node .\scripts\smoke-enrollment.js
```

Optional selectors:

```powershell
$env:STUDENT_USERNAME='student1'
$env:COURSE_CODE='CS101'
node .\scripts\smoke-enrollment.js
```

## Enroll whole class smoke test

```powershell
cd c:\Users\Talal\coding\ams\backend
$env:BASE_URL='http://localhost:5000'
$env:ADMIN_USERNAME='admin'
$env:ADMIN_PASSWORD='admin123'
node .\scripts\smoke-enroll-class.js
```
