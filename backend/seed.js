const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not set in .env file');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Check if admin already exists
    let adminUser = await User.findOne({ role: 'admin' });

    if (adminUser) {
        console.log('Admin account found, updating...');
        adminUser.name = 'Admin';
        adminUser.email = 'admin';
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('Admin account updated successfully!');
    } else {
        console.log('Creating new Admin account...');
        adminUser = new User({
          name: 'Admin',
          email: 'admin',
          password: hashedPassword,
          role: 'admin',
        });
        await adminUser.save();
        console.log('Admin account created successfully!');
    }

    console.log('Username: admin');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
