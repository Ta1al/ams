const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Program = require('./models/Program');
const Discipline = require('./models/Discipline');
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

    // Seed Department
    let department = await Department.findOne({ name: 'Department of Computer Science' });
    if (!department) {
      department = await Department.create({
        name: 'Department of Computer Science',
      });
      console.log('Department created: Department of Computer Science');
    }

    // Seed Programs
    const programSeeds = [
      { name: 'Computer Science', level: 'BS' },
      { name: 'Computer Science', level: 'MS' },
      { name: 'Computer Science', level: 'PhD' },
      { name: 'Computer Science', level: 'Diploma' },
    ];

    const programsByLevel = {};
    for (const seed of programSeeds) {
      let program = await Program.findOne({
        name: seed.name,
        level: seed.level,
        department: department._id,
      });
      if (!program) {
        program = await Program.create({
          name: seed.name,
          level: seed.level,
          department: department._id,
        });
        console.log(`Program created: ${seed.name} (${seed.level})`);
      }
      programsByLevel[seed.level] = program;
    }

    // Seed Disciplines under BS program
    const bsProgram = programsByLevel.BS;
    if (bsProgram) {
      const disciplineNames = ['Artificial Intelligence', 'Data Science'];
      for (const name of disciplineNames) {
        const exists = await Discipline.findOne({ name, program: bsProgram._id });
        if (!exists) {
          await Discipline.create({ name, program: bsProgram._id });
          console.log(`Discipline created: ${name}`);
        }
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
