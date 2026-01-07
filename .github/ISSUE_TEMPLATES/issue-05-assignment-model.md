---
name: Create Assignment Model and Schema
about: Create database schema for assignments (similar to Google Classroom)
title: '[Backend] Create Assignment Model and Schema'
labels: 'backend, database, priority: high, phase: 3'
assignees: ''
---

## Description
Create the database schema for assignments similar to Google Classroom. This includes both the Assignment model (created by teachers) and the Submission model (submitted by students).

## Priority
**High** - Required for Phase 3 (Assignment System)

## Estimated Effort
2-3 hours

## Requirements
- Teachers can create assignments for courses
- Support different assignment types (homework, quiz, project, exam)
- Set due dates and point values
- Track submission status
- Support file attachments/links
- Track student submissions with grades and feedback

## Schema Structures

### Assignment Model
**File**: `/backend/models/Assignment.js`

```javascript
{
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  assignmentType: {
    type: String,
    enum: ['homework', 'quiz', 'project', 'exam', 'other'],
    default: 'homework'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  instructions: {
    type: String,
    default: ''
  },
  allowLateSubmissions: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  timestamps: true
}
```

### Submission Model
**File**: `/backend/models/Submission.js`

```javascript
{
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'submitted', 'graded', 'returned'],
    default: 'assigned'
  },
  submittedAt: {
    type: Date
  },
  submissionText: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  grade: {
    type: Number,
    min: 0,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  timestamps: true
}
```

## Acceptance Criteria
- [ ] Assignment model created in `/backend/models/Assignment.js`
- [ ] Submission model created in `/backend/models/Submission.js`
- [ ] All required fields defined with proper types
- [ ] Enum validation for assignmentType and status
- [ ] References to User and Course models set up correctly
- [ ] Attachments array structure defined (support for multiple files)
- [ ] Proper indexes added for efficient queries:
  - Assignment: `{ course: 1, dueDate: 1 }`
  - Submission: `{ assignment: 1, student: 1 }` (unique compound)
- [ ] Default values set appropriately
- [ ] Validation rules implemented (min values, required fields)
- [ ] Timestamps enabled on both models

## Schema Features

### Assignment Features
- **Multiple Assignment Types**: Categorize as homework, quiz, project, or exam
- **File Attachments**: Support multiple files with metadata
- **Due Date Tracking**: Store deadline for submissions
- **Points System**: Set maximum points for grading
- **Late Submissions**: Toggle whether to accept late work
- **Draft/Published State**: Control visibility to students

### Submission Features
- **Status Workflow**: Track progression (assigned → submitted → graded → returned)
- **Late Detection**: Automatically flag late submissions
- **File Attachments**: Support student file uploads
- **Text Submission**: Support text-based answers
- **Grading**: Store grade and feedback
- **Audit Trail**: Track who graded and when

## Indexes for Performance
```javascript
// Assignment Model
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ assignedBy: 1 });

// Submission Model
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, status: 1 });
```

## Virtual Fields (Optional Enhancement)
```javascript
// Assignment Model
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Submission Model
submissionSchema.virtual('submissionDelay').get(function() {
  if (!this.submittedAt) return null;
  // Calculate delay from assignment due date
});
```

## Technical Notes
- Use Mongoose Schema with strict mode
- Enable timestamps for audit trail
- Compound unique index on Submission (assignment + student) prevents duplicate submissions
- File attachments stored as metadata (actual files handled separately)
- isLate should be calculated at submission time by comparing submittedAt with dueDate

## Testing Considerations
- Verify enum values are enforced
- Test unique constraint on submission (one per student per assignment)
- Test cascade behavior if assignment is deleted
- Validate date comparisons for late submissions
- Ensure grade cannot exceed totalPoints

## Dependencies
None - This is a foundational task

## Related Issues
- Issue #6: Create Assignment Controller and Routes (depends on this)
- Issue #12: Add File Upload System (for handling actual file storage)
