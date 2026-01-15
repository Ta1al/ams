const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Department = require('./models/Department');
const Discipline = require('./models/Discipline');
const Program = require('./models/Program');
const ClassModel = require('./models/Class');
const Course = require('./models/Course');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Hard reset database (dev only)
    try {
      await mongoose.connection.dropDatabase();
      console.log('🧹 Dropped database');
    } catch (err) {
      console.warn(`⚠️ dropDatabase not permitted (${err.message}). Falling back to deleting collections...`);
      const deletions = [
        User.deleteMany({}),
        Faculty.deleteMany({}),
        Department.deleteMany({}),
        Discipline.deleteMany({}),
        Program.deleteMany({}),
        ClassModel.deleteMany({}),
        Course.deleteMany({}),
      ];
      await Promise.all(deletions);
      console.log('🧹 Cleared collections');
    }

    // Seed Admin User
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not set in .env file');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = await User.create({
      name: 'Admin',
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin account created');

    // Seed Faculty
    const faculty = await Faculty.create({ name: 'Faculty of Computing' });
    console.log('Faculty created: Faculty of Computing');

    // Seed Department
    const department = await Department.create({
      name: 'Department of Computer Science',
      faculty: faculty._id,
    });
    console.log('Department created: Department of Computer Science');

    // Seed Discipline
    const discipline = await Discipline.create({
      name: 'Software Engineering',
      department: department._id,
    });
    console.log('Discipline created: Software Engineering');

    // Seed Program
    const program = await Program.create({
      level: 'BS',
      discipline: discipline._id,
      department: department._id,
    });
    console.log('Program created: BS');

    // Seed Classes (Sections)
    const [classRegular, classSS1, classSS2] = await ClassModel.insertMany([
      {
        department: department._id,
        discipline: discipline._id,
        program: program._id,
        section: 'Regular',
        session: { startYear: 2025, endYear: 2026 },
      },
      {
        department: department._id,
        discipline: discipline._id,
        program: program._id,
        section: 'Self Support 1',
        session: { startYear: 2025, endYear: 2026 },
      },
      {
        department: department._id,
        discipline: discipline._id,
        program: program._id,
        section: 'Self Support 2',
        session: { startYear: 2025, endYear: 2026 },
      },
    ]);
    console.log('Classes created: Regular, Self Support 1, Self Support 2');

    // Seed Teachers
    const teacherPassword = await bcrypt.hash('teacher123', salt);
    const [teacher1, teacher2] = await User.insertMany([
      {
        name: 'Teacher One',
        username: 'teacher1',
        password: teacherPassword,
        role: 'teacher',
        department: department._id,
      },
      {
        name: 'Teacher Two',
        username: 'teacher2',
        password: teacherPassword,
        role: 'teacher',
        department: department._id,
      },
    ]);
    console.log('Teachers created: teacher1, teacher2 / teacher123');

    // Seed Students
    const studentPassword = await bcrypt.hash('student123', salt);
    const students = await User.insertMany([
      {
        name: 'Student One',
        username: 'student1',
        password: studentPassword,
        role: 'student',
        program: program._id,
        class: classRegular._id,
      },
      {
        name: 'Student Two',
        username: 'student2',
        password: studentPassword,
        role: 'student',
        program: program._id,
        class: classRegular._id,
      },
    ]);
    console.log(`Students created: ${students.map((s) => s.username).join(', ')} / student123`);

    // Seed Course offerings (must include class)
    const courseRegular = await Course.create({
      name: 'Programming Fundamentals',
      code: 'PF101',
      department: department._id,
      discipline: discipline._id,
      program: program._id,
      class: classRegular._id,
      teacher: teacher1._id,
      enrolledStudents: students.map((s) => s._id),
    });
    const courseSS1 = await Course.create({
      name: 'Programming Fundamentals',
      code: 'PF101',
      department: department._id,
      discipline: discipline._id,
      program: program._id,
      class: classSS1._id,
      teacher: teacher2._id,
      enrolledStudents: [],
    });

    console.log('Course offerings created: PF101 (Regular, Self Support 1)');

    console.log('\n✅ Database seeded successfully!');
    console.log(`Admin username: ${adminUsername}`);
    console.log('Admin password: (from ADMIN_PASSWORD or default admin123)');
    console.log('Teacher username: teacher1');
    console.log('Teacher password: teacher123');
    console.log('Student username: student1');
    console.log('Student password: student123');
    console.log(`Sample course code: ${courseRegular.code}`);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
