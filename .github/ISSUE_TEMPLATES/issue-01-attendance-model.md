---
name: Create Attendance Model and Schema
about: Create the Mongoose schema for tracking attendance records in the database
title: '[Backend] Create Attendance Model and Schema'
labels: 'backend, database, priority: critical, phase: 1'
assignees: ''
---

## Description
Create the Mongoose schema for tracking attendance records in the database. This is the foundation for the entire attendance tracking system.

## Priority
**Critical** - Required for Phase 1

## Estimated Effort
2-3 hours

## Requirements
- Link attendance to a specific course and date
- Track individual student attendance (present/absent/late)
- Store teacher who marked attendance
- Include timestamps for audit trail
- Support filtering by date range, course, student

## Schema Structure
```javascript
{
  course: ObjectId (ref: Course),
  date: Date,
  session: String, // e.g., "Morning", "Afternoon", "9:00-10:30"
  studentRecords: [{
    student: ObjectId (ref: User),
    status: String (enum: ['present', 'absent', 'late']),
    remarks: String
  }],
  markedBy: ObjectId (ref: User),
  notes: String,
  timestamps: true
}
```

## File Location
`/backend/models/Attendance.js`

## Acceptance Criteria
- [ ] Attendance model created in `/backend/models/Attendance.js`
- [ ] Schema includes: course, date, studentRecords[], markedBy, notes
- [ ] Student records include: student (ref), status (present/absent/late)
- [ ] Proper indexes for efficient queries (course + date)
- [ ] Validation rules implemented (required fields, enum values)
- [ ] Unique compound index on course + date to prevent duplicate records

## Technical Notes
- Use Mongoose Schema with proper types and refs
- Add compound index: `{ course: 1, date: 1 }, { unique: true }`
- Set default status validation to enum: ['present', 'absent', 'late']
- Enable timestamps for audit trail

## Dependencies
None - This is a foundational task

## Related Issues
- Issue #2: Create Attendance Controller and Routes (depends on this)
