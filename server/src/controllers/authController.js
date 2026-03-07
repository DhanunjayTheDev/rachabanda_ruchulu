const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    const token = generateToken(user._id, 'user');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, 'user');

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, restaurantName } = req.body;

    if (!name || !email || !phone || !password || !restaurantName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      phone,
      password: hashedPassword,
      restaurantName,
    });

    await admin.save();

    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      admin: { id: admin._id, name: admin.name, restaurantName: admin.restaurantName },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    res.json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      admin: { id: admin._id, name: admin.name, restaurantName: admin.restaurantName },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerAdmin,
  loginAdmin,
};
