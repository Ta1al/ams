# Course Management: Separation of Course & Course Offerings

## Overview

The system has been restructured to separate the concept of **"Course"** (the subject being taught) from **"Course Offering"** (a specific instance of that course for a teacher/batch/semester).

### Problem Solved
Previously, the same course appearing in multiple offerings (e.g., "Programming Fundamentals" taught by Teacher A and Teacher B) would appear as duplicate rows in the Courses table. Now:
- **Courses table** displays unique courses only (no duplicates)
- **Course Offerings page** shows all instances of that course (different teachers, different batches)
- **Course Detail page** shows statistics for a specific offering (attendance, sessions, enrollments)

---

## Complete User Flow - Three-Layer Navigation

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: COURSES PAGE (Admin)                            │
│ - Shows all unique courses                              │
│ - Groups duplicate courses by "Offerings" count         │
│ - Action: Click "View" → Goes to Offerings Page        │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: COURSE OFFERINGS PAGE (Admin)                  │
│ - Shows all instances of selected course                │
│ - Each card = one offering (teacher + batch)            │
│ - Can add/delete offerings                              │
│ - Can view enrollment count per offering                │
│ - Action: Click "View Details" → Goes to Detail Page   │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: COURSE DETAIL PAGE                             │
│ - Shows metrics for specific offering:                  │
│   * Attendance rate                                     │
│   * Total sessions held                                 │
│   * Enrolled students list                              │
│   * Attendance timeline                                 │
│ - Actions:                                              │
│   * Mark attendance                                     │
│   * Enroll/unenroll students                            │
│ - Accessible by: Admin, Teacher, Students              │
└─────────────────────────────────────────────────────────┘
```

---

## Detailed Flow Breakdown

### Layer 1: Courses Page

**Route:** `/admin/courses`

**What Admin Sees:**

| Name | Code | Program | Discipline | Department | Offerings | Actions |
|------|------|---------|-----------|-----------|-----------|---------|
| Programming Fundamentals | CS101 | 5th Semester | CS | CS Dept | **3** | [View] [Edit] [Delete] |
| Database Design | CS201 | 5th Semester | CS | CS Dept | **2** | [View] [Edit] [Delete] |

**Features:**
- ✅ **Deduplication:** Same course appears only once (no duplicates)
- ✅ **Offering Count:** Shows how many times the course is being taught
- ✅ **View Button:** Navigates to Course Offerings Page for that course
- ✅ **Edit Button:** Edits course definition (name, code, program, discipline, department)
- ✅ **Delete Button:** Removes the course entirely

**User Actions:**

1. **Create New Course:**
   - Click "Add Course" button
   - Fill in: Name, Code, Program
   - Save → Course is created WITHOUT teacher assignment
   
2. **View Offerings:**
   - Click "View" button on any course row
   - Navigates to: `/admin/courses/{courseId}/offerings`

---

### Layer 2: Course Offerings Page (NEW)

**Route:** `/admin/courses/{courseId}/offerings`

**What Admin Sees:**

Header showing:
- Course name and code
- Program level
- Discipline name
- "Add Offering" button

**Offerings Display (as Cards):**

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│ Offering 1                       │     │ Offering 2                       │
├─────────────────────────────────┤     ├─────────────────────────────────┤
│ 👨 Teacher: Teacher One          │     │ 👨 Teacher: Teacher Two          │
│    @teacher_one                  │     │    @teacher_two                  │
│                                  │     │                                  │
│ 👥 Class: Section A              │     │ 👥 Class: Section B              │
│    2024-2025                     │     │    2024-2025                     │
│                                  │     │                                  │
│ 📊 45 students enrolled          │     │ 📊 38 students enrolled          │
│                                  │     │                                  │
│ [View Details] [Delete]          │     │ [View Details] [Delete]          │
└─────────────────────────────────┘     └─────────────────────────────────┘

┌─────────────────────────────────┐
│ Offering 3                       │
├─────────────────────────────────┤
│ 👨 Teacher: Teacher One          │
│    @teacher_one                  │
│                                  │
│ 👥 Class: Section A              │
│    2023-2024 (Previous Year)    │
│                                  │
│ 📊 42 students enrolled          │
│                                  │
│ [View Details] [Delete]          │
└─────────────────────────────────┘
```

**Features:**
- ✅ **Card Display:** Each offering shown as a card with key information
- ✅ **Teacher Info:** Shows who teaches this section
- ✅ **Batch Info:** Shows which class/batch this offering is for
- ✅ **Enrollment Count:** Shows how many students are enrolled
- ✅ **Add Offering:** New modal to assign teacher + batch to this course

**Add Offering Modal:**

```
┌─────────────────────────────────────┐
│ Add Course Offering                 │
├─────────────────────────────────────┤
│                                      │
│ Course: [Programming Fundamentals]  │
│                                      │
│ Teacher: [Select teacher ▼]         │
│          └─ Teacher One             │
│          └─ Teacher Two             │
│          └─ Teacher Three           │
│                                      │
│ Class/Batch: [Select class ▼]       │
│              └─ 5th Sem - Section A │
│              └─ 5th Sem - Section B │
│                                      │
│ ℹ️  This will create a new offering │
│    of Programming Fundamentals for  │
│    the selected teacher and class.  │
│                                      │
│ [Cancel] [Create Offering]          │
└─────────────────────────────────────┘
```

**User Actions:**

1. **Add New Offering:**
   - Click "Add Offering" button
   - Select Teacher from dropdown
   - Select Class/Batch from dropdown
   - Click "Create Offering"
   - Backend creates a new course record with same name/code/program but different teacher/class

2. **View Specific Offering Details:**
   - Click "View Details" on any offering card
   - Navigates to: `/courses/{offeringId}`
   - Opens Course Detail Page

3. **Remove Offering:**
   - Click delete icon on offering card
   - Confirms deletion
   - Removes that specific offering (but keeps the course definition)

---

### Layer 3: Course Detail Page

**Route:** `/courses/{offeringId}`

**What Anyone Sees:**

This page shows **detailed statistics for a specific offering**:

**Header Section:**
- Course name and code
- Teacher name (for this offering)
- Class/Batch information

**Statistics Cards:**
```
┌──────────────────────┐  ┌──────────────────────┐
│ 📊 Attendance Rate   │  │ 📅 Sessions Held     │
│                      │  │                      │
│      78%             │  │       24             │
│                      │  │                      │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ 👥 Total Students    │  │ 📝 Last Session      │
│                      │  │                      │
│      45              │  │  Jan 15, 2026        │
│                      │  │                      │
└──────────────────────┘  └──────────────────────┘
```

**Attendance Timeline:**
- Shows recent attendance records
- Each record shows: Date, Present/Absent/Total count
- Sortable by date

**Student List (Admin/Teacher View):**
- Enrolled students table
- Can add/remove students
- Duplicate enrollment prevention

**Features (depending on user role):**
- ✅ **Admin/Teacher:** Can mark attendance, manage enrollments, view all statistics
- ✅ **Student:** Can view their own attendance and enrollment status
- ✅ **Real-time Data:** Statistics calculated from actual attendance records

---

## Architecture Details

### Data Model (Logical Separation)

```
┌─────────────────────────────────────────────────────────┐
│ COURSE (Subject Definition)                             │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   _id: "course_001"                                     │
│   name: "Programming Fundamentals"                      │
│   code: "CS101"                                         │
│   program: { _id, level }                              │
│   discipline: { _id, name }                            │
│   department: { _id, name }                            │
│   // NO teacher or class at this level                 │
│ }                                                       │
└──────────────────────────────────────────────────────────┘

Each course can have MULTIPLE offerings:

┌──────────────────────────────────────────────────────────┐
│ OFFERING 1 (Record for Teacher A, Section A)           │
├──────────────────────────────────────────────────────────┤
│ {                                                        │
│   _id: "offering_001"                                   │
│   name: "Programming Fundamentals"  (same as parent)    │
│   code: "CS101"                                          │
│   program: { same as parent }                           │
│   discipline: { same as parent }                        │
│   department: { same as parent }                        │
│   teacher: { _id, name, username }                      │
│   class: { _id, section, program, sessionLabel }        │
│   enrolledStudents: [student_id_1, student_id_2, ...]   │
│ }                                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ OFFERING 2 (Record for Teacher B, Section B)           │
├──────────────────────────────────────────────────────────┤
│ {                                                        │
│   _id: "offering_002"                                   │
│   name: "Programming Fundamentals"  (same as parent)    │
│   code: "CS101"                                          │
│   program: { same as parent }                           │
│   discipline: { same as parent }                        │
│   department: { same as parent }                        │
│   teacher: { _id, name, username }                      │
│   class: { _id, section, program, sessionLabel }        │
│   enrolledStudents: [student_id_3, student_id_4, ...]   │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
```

**Note:** Current implementation stores both course definition AND offering data together in a single `courses` collection. The logical separation above will be fully implemented in future database restructuring.

---

## Frontend Implementation Status

### ✅ Completed

1. **CoursesPage.jsx** (`/admin/courses`)
   - Shows unique courses (deduplication via useMemo)
   - "Offerings" column shows count of duplicates
   - View button navigates to CourseOfferingsPage
   - Create/Edit course forms simplified (no teacher/class fields)

2. **CourseOfferingsPage.jsx** (NEW) (`/admin/courses/{courseId}/offerings`)
   - Displays all offerings of selected course as cards
   - "Add Offering" modal with teacher/class selection
   - "View Details" button navigates to CourseDetailPage
   - Delete offering functionality

3. **CourseDetailPage.jsx** (`/courses/{offeringId}`)
   - Already shows dynamic attendance statistics
   - Displays real attendance data (not hardcoded)
   - Shows enrolled students list
   - Can mark attendance and manage enrollments

4. **App.jsx (Router)**
   - New route: `/admin/courses/:courseId/offerings`
   - Imports CourseOfferingsPage component
   - Proper role-based access control

---

## Frontend Navigation Routes

```
/admin/courses
    ├─ Shows: Unique courses
    ├─ Lists all courses (deduplicated)
    ├─ Action: View → Navigate to offerings
    └─ Routes to: /admin/courses/{courseId}/offerings

/admin/courses/{courseId}/offerings
    ├─ Shows: All offerings of that course
    ├─ Cards for each teacher/batch combo
    ├─ Action: View Details → Navigate to course detail
    └─ Routes to: /courses/{offeringId}

/courses/{offeringId}
    ├─ Shows: Detailed stats for one offering
    ├─ Attendance rate, sessions, students
    ├─ Attendance records and timeline
    └─ Manage: Mark attendance, enroll students
```

---

## API Endpoints Used

### Get All Courses
```
GET /api/courses
→ Returns all course instances (courses + offerings combined)
→ Used by CoursesPage and CourseOfferingsPage
```

### Create Course (or Offering)
```
POST /api/courses
Payload: {
  name: string,
  code: string,
  program: string (ID),
  discipline: string (ID),
  department: string (ID),
  teacher?: string (ID),           // Optional - only for offerings
  class?: string (ID),             // Optional - only for offerings
}
→ Used by CoursesPage (create course) and CourseOfferingsPage (create offering)
```

### Get Course Details
```
GET /api/courses/{courseId}
→ Returns course object with all data
→ Used by CourseDetailPage
```

### Get Enrolled Students
```
GET /api/courses/{courseId}/enrolledStudents
→ Returns array of enrolled students
→ Used by CourseDetailPage
```

### Enroll Students
```
POST /api/courses/{courseId}/enroll
Payload: { studentIds: [string] }
→ Enrolls students in course
→ Used by CourseDetailPage
```

### Get Attendance
```
GET /api/attendance?course={courseId}
→ Returns attendance records for course
→ Used by CourseDetailPage for statistics
```

---

## User Roles & Access

### Admin
- ✅ Can view Courses page (all unique courses)
- ✅ Can create new courses
- ✅ Can view Course Offerings page
- ✅ Can add/remove offerings
- ✅ Can view Course Detail (any offering)
- ✅ Can manage enrollments
- ✅ Can mark attendance

### Teacher
- ✅ Can view Course Detail page (only their offerings)
- ✅ Can mark attendance
- ✅ Can manage enrollments (view/add students)
- ✅ Cannot create/delete courses
- ✅ Cannot manage offerings

### Student
- ✅ Can view Course Detail page (enrolled courses only)
- ✅ Can view their attendance
- ✅ Cannot mark attendance
- ✅ Cannot enroll/remove themselves
- ✅ Cannot manage courses or offerings

---

## Summary: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Courses Display** | Shows all instances (duplicates) | Shows unique courses with offering count |
| **Course Creation** | Required teacher assignment | Teacher assignment optional (assign at offering level) |
| **Duplicate Problem** | "CS101" appears 3 times in same table | "CS101" appears once with "Offerings: 3" badge |
| **Admin Workflow** | Click course → See one offering only | Click course → See all offerings as cards → Click offering → See details |
| **Navigation** | 2 layers (Courses → Detail) | 3 layers (Courses → Offerings → Detail) |
| **Offering Management** | No way to add/remove offerings | Clear UI to add/remove offerings |
| **Course Definition Clarity** | Mixed with offering data | Separated logically |
| **Scalability** | Hard to manage multi-section courses | Easy to add/remove sections |

---

## Future Enhancements

1. **Backend Refactoring:** Separate `courses` and `courseOfferings` collections
2. **Offering Edit:** Allow modifying teacher/class of existing offering
3. **Offering Schedule:** Add time/location to offerings
4. **Bulk Actions:** Add multiple offerings at once
5. **Course Template:** Create offering template for recurring courses
6. **Analytics:** Compare attendance across offerings
7. **Sync:** Automatically create offerings for same course across years

