# Quick Start Guide - AMS Development

This guide helps you get started with implementing the Attendance Management System enhancements.

## 📖 What Was Analyzed

The codebase was thoroughly analyzed to create a comprehensive action plan:

### Current System Strengths
- ✅ **Authentication**: JWT-based auth with role-based access control (Admin, Teacher, Student)
- ✅ **Database Models**: User, Course, Faculty, Department, Division, Program
- ✅ **Basic UI**: Login, dashboards, and skeleton pages exist
- ✅ **Architecture**: Clean MERN stack with MVC pattern

### Identified Gaps
- ❌ **Attendance Backend**: UI exists but no backend (model, controllers, APIs)
- ❌ **Assignment System**: Completely missing (backend + frontend)
- ❌ **Course Enrollment**: No way to link students to courses
- ❌ **File Upload**: No file storage system
- ❌ **Advanced Features**: No notifications, reports, or timetables

## 🎯 The Plan

**15 issues organized into 6 phases** covering everything needed for a full-featured AMS with Google Classroom-like assignments.

### Critical Path (Must-Have)
```
Phase 1 → Phase 2 → Phase 3 → Phase 4
  (Attendance Backend)
      ↓
  (Attendance Frontend)
      ↓
  (Assignment Backend)
      ↓
  (Assignment Frontend)
```

**Estimated Effort**: 20-25 hours for MVP  
**Estimated Total**: 50-60 hours for full system

## 🚀 How to Get Started

### Option 1: Automated Issue Creation (Recommended)

If you have GitHub CLI access:

```bash
# Navigate to the repository
cd /path/to/ams

# Run the automated script
./create-issues.sh

# Follow the prompts
```

This will create Issues #1-6 automatically with proper labels and formatting.

### Option 2: Manual Issue Creation

1. Go to https://github.com/Ta1al/ams/issues/new
2. Open `.github/ISSUE_TEMPLATES/issue-01-attendance-model.md`
3. Copy the content (skip the frontmatter between `---`)
4. Paste into GitHub issue form
5. Add labels from the frontmatter: `backend, database, priority: critical, phase: 1`
6. Create issue
7. Repeat for issues #2-6

### Option 3: Batch Creation with GitHub CLI

```bash
cd /path/to/ams

# Create each issue individually
gh issue create \
  --title "[Backend] Create Attendance Model and Schema" \
  --body-file .github/ISSUE_TEMPLATES/issue-01-attendance-model.md \
  --label "backend,database,priority: critical,phase: 1"

# Repeat for other issues...
```

## 📁 Documentation Structure

```
ams/
├── ACTION_PLAN.md                    # Complete 15-issue plan
├── ROADMAP.md                        # Visual timeline & progress
├── QUICK_START.md                    # This file
├── create-issues.sh                  # Automated issue creation
└── .github/
    └── ISSUE_TEMPLATES/
        ├── README.md                 # Issue creation guide
        ├── issue-01-attendance-model.md
        ├── issue-02-attendance-controller.md
        ├── issue-03-course-enrollment.md
        ├── issue-04-attendance-frontend.md
        ├── issue-05-assignment-model.md
        └── issue-06-assignment-controller.md
```

## 🔍 Understanding the Issues

### Phase 1: Attendance Backend (Critical)

**Issue #1: Attendance Model**
- Create Mongoose schema for attendance records
- Link to courses, dates, and students
- ~2-3 hours

**Issue #2: Attendance Controller**
- Build REST API for attendance CRUD operations
- Implement authorization (teacher of course only)
- Calculate statistics
- ~3-4 hours

**Issue #3: Course Enrollment**
- Add student enrollment to courses
- Support bulk enrollment by program/division
- Required for attendance to work
- ~2-3 hours

### Phase 2: Attendance Frontend (High Priority)

**Issue #4: Frontend Integration**
- Connect existing UI to new APIs
- Add course/date selection
- Real-time data display
- ~2-3 hours

### Phase 3: Assignment Backend (High Priority)

**Issue #5: Assignment Model**
- Create Assignment and Submission schemas
- Support different assignment types
- File attachment metadata
- ~2-3 hours

**Issue #6: Assignment Controller**
- Assignment CRUD APIs
- Submission workflow
- Grading system
- ~4-5 hours

### Phase 4-6: See ACTION_PLAN.md

Issues #7-15 cover assignment frontend, notifications, reports, testing, etc.

## 🎓 For Developers

### Before You Start

1. **Read the Documentation**
   - `ACTION_PLAN.md` - Full specifications
   - Specific issue template for your task
   - Existing code in similar areas

2. **Set Up Your Environment**
   ```bash
   # Backend
   cd backend
   npm install
   cp example.env .env
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev

   # Frontend (in another terminal)
   cd frontend
   npm install
   cp example.env .env
   # Edit .env with API URL
   npm run dev
   ```

3. **Understand the Dependencies**
   - Issue #1 must be done before #2
   - Issues #1, #2, #3 must be done before #4
   - Issue #5 must be done before #6
   - Issues #1-3 can be done in parallel with #5-6

### Development Workflow

1. **Pick an Issue**: Start with Phase 1, Issue #1
2. **Create a Branch**: `git checkout -b feature/issue-1-attendance-model`
3. **Implement**: Follow acceptance criteria in issue
4. **Test**: Manually test or write tests
5. **Commit**: `git commit -m "feat: add attendance model (#1)"`
6. **Push**: `git push origin feature/issue-1-attendance-model`
7. **PR**: Create pull request referencing the issue
8. **Review**: Address feedback
9. **Merge**: Once approved

### Code Conventions

**Backend** (Node.js/Express):
- Use `async/await` for database operations
- Always use try/catch for error handling
- Return proper HTTP status codes
- Use middleware for authorization
- Follow existing controller patterns

**Frontend** (React):
- Functional components with hooks
- Use Tailwind + DaisyUI classes
- Get auth token from `useAuth()` hook
- Handle loading and error states
- Use existing component patterns

### Testing Your Work

**Backend**:
```bash
# Test with curl or Postman
curl -X POST http://localhost:5001/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"courseId": "...", "date": "2026-01-07", ...}'
```

**Frontend**:
- Open browser to http://localhost:5173
- Login with test credentials
- Navigate to your new feature
- Verify it works as expected

## 👥 For Project Managers

### Setting Up the Project

1. **Create the Issues**
   - Use `./create-issues.sh` or create manually
   - Verify all labels are applied correctly

2. **Set Up Project Board**
   - Go to Projects tab in GitHub
   - Create columns: Backlog, In Progress, Review, Done
   - Add all issues to Backlog

3. **Create Milestones**
   - Milestone 1: Working Attendance (Issues #1-4, Target: Week 3)
   - Milestone 2: Working Assignments (Issues #5-8, Target: Week 6)
   - Milestone 3: Full Features (Issues #9-12, Target: Week 10)
   - Milestone 4: Production Ready (Issues #13-15, Target: Week 12)

4. **Assign Issues**
   - Backend team: Issues #1, #2, #3, #5, #6
   - Frontend team: Issues #4, #7, #8
   - Full stack: Issues #9-15

### Tracking Progress

**Weekly Reviews**:
- Check ROADMAP.md progress bars
- Update issue statuses
- Identify blockers
- Adjust timeline if needed

**Daily Standups**:
- What did you complete?
- What are you working on?
- Any blockers?

## 🆘 Need Help?

### Documentation Resources
- **ACTION_PLAN.md**: Detailed specs for all 15 issues
- **ROADMAP.md**: Visual timeline and progress tracking
- **documentation/**: Auto-generated API docs
- **Issue Templates**: Specific requirements per task

### Common Questions

**Q: Which issue should I start with?**  
A: Start with Issue #1 if doing backend, or wait for Issues #1-3 if doing frontend.

**Q: Can I work on multiple issues at once?**  
A: Yes, but only if they don't depend on each other. See dependency chains in ACTION_PLAN.md.

**Q: What if I find a bug in existing code?**  
A: Focus on your issue first. Note the bug for later unless it blocks your work.

**Q: The estimate seems wrong, what do I do?**  
A: Update the issue with your actual time spent. Estimates are rough guidelines.

**Q: Can I change the approach described in the issue?**  
A: Yes, if you have a better solution. Document why in the PR.

### Getting Unstuck

1. **Read the issue template again** - All details are there
2. **Check existing similar code** - Look at other controllers/models
3. **Check documentation/** - Auto-generated API docs
4. **Ask in issue comments** - Tag team members
5. **Review PR from similar issue** - Learn from others

## ✅ Success Criteria

### For Issue #1 (Example)
- [ ] File created: `/backend/models/Attendance.js`
- [ ] All fields defined correctly
- [ ] Indexes added for performance
- [ ] Validation rules implemented
- [ ] Can create/save attendance records
- [ ] No errors in console

### For All Issues
- Code follows existing patterns
- Authorization works correctly
- Error handling implemented
- Manual testing completed
- PR approved by reviewer
- Documentation updated (if needed)

## 🎉 Next Steps

1. **Right Now**: Create the GitHub issues
2. **Today**: Assign issues to team members
3. **This Week**: Start Phase 1 (Issues #1-3)
4. **Next Week**: Complete Phase 1, start Phase 2
5. **Week 3**: Complete MVP (Phases 1-2)
6. **Week 6**: Complete assignments (Phases 3-4)

---

## 📞 Contact & Support

- **GitHub Issues**: For technical discussions
- **Pull Requests**: For code reviews
- **Project Board**: For progress tracking
- **Team Chat**: For quick questions

---

**Remember**: Start small, test often, commit frequently. You've got this! 🚀

**First Action**: Run `./create-issues.sh` to create the issues, then assign Issue #1 to your backend team.
