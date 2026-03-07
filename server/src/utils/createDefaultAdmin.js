const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'dhanunjay@gmail.com' });
    
    if (existingAdmin) {
      console.log('✓ Default admin already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Dhanunjay@123', 10);

    // Create default admin
    const admin = new Admin({
      name: 'Dhanunjay',
      email: 'dhanunjay@gmail.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      permissions: ['all'],
    });

    await admin.save();
    console.log('✓ Default admin created successfully');
    console.log('  Email: dhanunjay@gmail.com');
    console.log('  Password: Dhanunjay@123');
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

module.exports = createDefaultAdmin;
