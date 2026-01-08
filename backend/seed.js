const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Department = require('./models/Department');
const Division = require('./models/Division');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Seed Admin User
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not set in .env file');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    let adminUser = await User.findOne({ username: adminUsername });
    if (adminUser) {
      console.log('Admin account found, updating...');
      adminUser.name = 'Admin';
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('Admin account updated!');
    } else {
      adminUser = await User.create({
        name: 'Admin',
        username: adminUsername,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin account created!');
    }

    // Seed Faculty
    let faculty = await Faculty.findOne({ name: 'Faculty of Computing' });
    if (!faculty) {
      faculty = await Faculty.create({ name: 'Faculty of Computing' });
      console.log('Faculty created: Faculty of Computing');
    }

    // Seed Department
    let department = await Department.findOne({ name: 'Department of Computer Science' });
    if (!department) {
      department = await Department.create({
        name: 'Department of Computer Science',
        faculty: faculty._id,
      });
      console.log('Department created: Department of Computer Science');
    }

    // Seed Disciplines
    const divisionNames = ['Artificial Intelligence', 'Data Science', 'Software Engineering', 'Cyber Security'];
    for (const name of divisionNames) {
      const exists = await Division.findOne({ name, department: department._id });
      if (!exists) {
        await Division.create({ name, department: department._id });
        console.log(`Discipline created: ${name}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`Admin username: ${adminUsername}`);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
