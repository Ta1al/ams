# GitHub Issues Creation Guide

This directory contains templates for creating GitHub issues for the Attendance Management System project.

## How to Create Issues

Since we cannot programmatically create issues due to access limitations, follow these steps:

### Option 1: Manual Creation via GitHub Web UI

1. Go to https://github.com/Ta1al/ams/issues/new
2. Copy the content from each issue template file
3. Create a new issue with the content
4. Apply the labels mentioned in the template frontmatter

### Option 2: Using GitHub CLI (if you have access)

If you have GitHub CLI installed and authenticated, you can create issues programmatically:

```bash
cd /home/runner/work/ams/ams

# Issue 1
gh issue create \
  --title "[Backend] Create Attendance Model and Schema" \
  --body-file .github/ISSUE_TEMPLATES/issue-01-attendance-model.md \
  --label "backend,database,priority: critical,phase: 1"

# Issue 2
gh issue create \
  --title "[Backend] Create Attendance Controller and Routes" \
  --body-file .github/ISSUE_TEMPLATES/issue-02-attendance-controller.md \
  --label "backend,api,priority: critical,phase: 1"

# Issue 3
gh issue create \
  --title "[Backend] Create Course Enrollment System" \
  --body-file .github/ISSUE_TEMPLATES/issue-03-course-enrollment.md \
  --label "backend,enhancement,priority: critical,phase: 1"

# Issue 4
gh issue create \
  --title "[Frontend] Integrate Attendance Frontend with Backend API" \
  --body-file .github/ISSUE_TEMPLATES/issue-04-attendance-frontend.md \
  --label "frontend,integration,priority: high,phase: 2"

# Issue 5
gh issue create \
  --title "[Backend] Create Assignment Model and Schema" \
  --body-file .github/ISSUE_TEMPLATES/issue-05-assignment-model.md \
  --label "backend,database,priority: high,phase: 3"

# Issue 6
gh issue create \
  --title "[Backend] Create Assignment Controller and Routes" \
  --body-file .github/ISSUE_TEMPLATES/issue-06-assignment-controller.md \
  --label "backend,api,priority: high,phase: 3"
```

## Issue Templates Available

### Phase 1: Core Attendance System (Backend)
- ✅ **Issue 1**: Create Attendance Model and Schema
- ✅ **Issue 2**: Create Attendance Controller and Routes  
- ✅ **Issue 3**: Create Course Enrollment System

### Phase 2: Attendance System (Frontend Integration)
- ✅ **Issue 4**: Integrate Attendance Frontend with Backend API

### Phase 3: Assignment System (Backend)
- ✅ **Issue 5**: Create Assignment Model and Schema
- ✅ **Issue 6**: Create Assignment Controller and Routes

### Phase 4: Assignment System (Frontend)
- ⚠️ **Issue 7**: Create Assignment Management UI for Teachers (see ACTION_PLAN.md)
- ⚠️ **Issue 8**: Create Assignment Submission UI for Students (see ACTION_PLAN.md)

### Phase 5: Enhanced Features
- ⚠️ **Issue 9**: Add Timetable/Schedule System (see ACTION_PLAN.md)
- ⚠️ **Issue 10**: Add Notification System (see ACTION_PLAN.md)
- ⚠️ **Issue 11**: Add Reporting and Analytics (see ACTION_PLAN.md)
- ⚠️ **Issue 12**: Add File Upload System (see ACTION_PLAN.md)

### Phase 6: Polish and Optimization
- ⚠️ **Issue 13**: Add Search and Filter Functionality (see ACTION_PLAN.md)
- ⚠️ **Issue 14**: Improve Dashboard Statistics (see ACTION_PLAN.md)
- ⚠️ **Issue 15**: Add Unit and Integration Tests (see ACTION_PLAN.md)

**Note**: ✅ = Template file created, ⚠️ = See ACTION_PLAN.md for full details

## Labels to Create

Before creating issues, ensure these labels exist in your repository:

### Priority Labels
- `priority: critical` (red)
- `priority: high` (orange)
- `priority: medium` (yellow)
- `priority: low` (green)

### Component Labels
- `backend` (blue)
- `frontend` (purple)
- `database` (cyan)
- `api` (teal)
- `integration` (magenta)

### Phase Labels
- `phase: 1` (dark blue)
- `phase: 2` (dark green)
- `phase: 3` (dark orange)
- `phase: 4` (dark purple)
- `phase: 5` (dark cyan)
- `phase: 6` (dark gray)

### Type Labels
- `enhancement` (light blue)
- `bug` (red)
- `documentation` (gray)

## Issue Dependencies

### Critical Path (Must be done in order)
1. Issue #1 → Issue #2 (Attendance model before controller)
2. Issue #3 (Enrollment system - independent)
3. Issues #1, #2, #3 → Issue #4 (Frontend integration needs all backend)
4. Issue #5 → Issue #6 (Assignment model before controller)
5. Issue #6 → Issues #7, #8 (Frontend needs backend APIs)

### Can be done in parallel
- Issues #1 and #3 (Attendance model and Enrollment)
- Issues #5 and #9 (Assignment model and Timetable)
- Issues #10, #11, #13, #14 (All enhancement features)

## Quick Start Guide

To get started with implementation:

1. **Start with Phase 1** - Core attendance backend
   - Create issues #1, #2, #3
   - Assign to backend developers
   - Complete in order: #1 → #2, #3 in parallel

2. **Move to Phase 2** - Connect frontend
   - Create issue #4
   - Assign to frontend developer
   - Requires #1, #2, #3 to be complete

3. **Continue with Phase 3** - Assignment backend
   - Create issues #5, #6
   - Similar pattern to Phase 1

4. **Proceed with Phase 4** - Assignment frontend
   - Create issues #7, #8
   - Similar pattern to Phase 2

5. **Add enhancements** - Phases 5-6
   - Prioritize based on user needs
   - Can be done incrementally

## Additional Resources

- **ACTION_PLAN.md**: Comprehensive plan with all 15 issues detailed
- **documentation/**: Auto-generated API and backend documentation
- **README.md**: Project setup and getting started

## Support

If you need help with any issue:
1. Refer to the ACTION_PLAN.md for detailed requirements
2. Check existing documentation in `/documentation`
3. Review similar existing code in the codebase
4. Consult with team members

---

**Last Updated**: 2026-01-07
