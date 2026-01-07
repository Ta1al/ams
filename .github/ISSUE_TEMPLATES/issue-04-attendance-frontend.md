---
name: Integrate Attendance Frontend with Backend API
about: Connect existing attendance UI pages to the new backend APIs
title: '[Frontend] Integrate Attendance Frontend with Backend API'
labels: 'frontend, integration, priority: high, phase: 2'
assignees: ''
---

## Description
Connect existing attendance UI pages to the new backend APIs. Currently, the attendance pages use mock/local data. This issue will integrate them with the real backend.

## Priority
**High** - Required for Phase 2

## Estimated Effort
2-3 hours

## Pages to Update

### 1. Teacher Attendance Page
**File**: `/frontend/src/pages/teacher/AttendancePage.jsx`

**Changes Needed**:
- Add course selection dropdown (fetch teacher's courses)
- Add date picker for marking attendance (default to today)
- Fetch enrolled students for selected course
- Save attendance to backend API (`POST /api/attendance`)
- Show past attendance records with edit capability
- Display loading states and error messages
- Add success notification after saving

**Current Issues**:
- Uses hardcoded student list from all users
- Attendance is only stored in local state (not persisted)
- No course selection
- No date selection

### 2. Student Attendance Page
**File**: `/frontend/src/pages/student/MyAttendancePage.jsx`

**Changes Needed**:
- Fetch real attendance data from API (`GET /api/attendance/my-attendance`)
- Display attendance by course with course names
- Show detailed statistics (total, present, absent, percentage)
- Add filters (by course, date range)
- Replace mock data with real API data
- Handle empty states (no attendance records)

**Current Issues**:
- Uses hardcoded mock data
- Shows fake attendance records
- No real statistics

## API Endpoints to Use

### Teacher Page
```javascript
// Get teacher's courses
GET /api/courses?teacher=${userId}

// Get enrolled students for course
GET /api/courses/:courseId/students

// Mark/Create attendance
POST /api/attendance
Body: {
  courseId: "...",
  date: "2026-01-07",
  studentRecords: [
    { studentId: "...", status: "present" },
    { studentId: "...", status: "absent" }
  ]
}

// Get past attendance for course
GET /api/attendance/course/:courseId?date=2026-01-07

// Update attendance
PUT /api/attendance/:attendanceId
Body: { studentRecords: [...] }
```

### Student Page
```javascript
// Get my attendance
GET /api/attendance/my-attendance

// Get my courses
GET /api/courses/student/:studentId
```

## Acceptance Criteria

### Teacher Page
- [ ] Course selection dropdown shows teacher's courses
- [ ] Date picker allows selecting date for attendance
- [ ] Student list shows only enrolled students for selected course
- [ ] Marking attendance saves to backend successfully
- [ ] Past attendance can be viewed and edited
- [ ] Loading states displayed during API calls
- [ ] Success message shown after saving
- [ ] Error messages displayed for failed operations
- [ ] "Mark All Present" button works with API

### Student Page
- [ ] Fetches and displays real attendance data from API
- [ ] Shows attendance grouped by course
- [ ] Calculates and displays correct statistics
- [ ] Shows course names (not just IDs)
- [ ] Filters by course work correctly
- [ ] Empty state shown when no attendance records
- [ ] Loading state displayed during API call
- [ ] Error handling for failed API calls

## UI/UX Improvements
- Add course filter dropdown on teacher page
- Add date navigation (previous/next day)
- Show attendance percentage per student on teacher page
- Add color coding for attendance status badges
- Show submission confirmation modal
- Add print/export functionality (future enhancement)

## Technical Notes
- Use existing `useAuth` hook for getting auth token
- Use `import.meta.env.VITE_API_URL` for API base URL
- Implement proper error handling with try/catch
- Show user-friendly error messages
- Add loading spinners using DaisyUI `loading` class
- Use DaisyUI toast/alert for success messages

## Example API Integration Code
```javascript
const markAttendance = async () => {
  try {
    setSaving(true);
    const response = await fetch(`${apiUrl}/api/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({
        courseId: selectedCourse,
        date: selectedDate,
        studentRecords: Object.entries(attendance).map(([studentId, status]) => ({
          student: studentId,
          status: status
        }))
      })
    });
    
    if (!response.ok) throw new Error('Failed to save attendance');
    
    const data = await response.json();
    // Show success message
    setSaved(true);
  } catch (error) {
    console.error('Error:', error);
    // Show error message
  } finally {
    setSaving(false);
  }
};
```

## Testing Checklist
- [ ] Teacher can select course from dropdown
- [ ] Students load for selected course
- [ ] Attendance saves successfully to backend
- [ ] Saved attendance can be viewed again
- [ ] Student sees their real attendance data
- [ ] Statistics calculate correctly
- [ ] All error cases handled gracefully
- [ ] Loading states work properly
- [ ] Date picker works correctly

## Dependencies
- Issue #1: Create Attendance Model (must be complete)
- Issue #2: Create Attendance Controller and Routes (must be complete)
- Issue #3: Create Course Enrollment System (must be complete)

## Related Issues
- Issue #9: Add Timetable/Schedule System (future enhancement)
- Issue #11: Add Reporting and Analytics (future enhancement)
