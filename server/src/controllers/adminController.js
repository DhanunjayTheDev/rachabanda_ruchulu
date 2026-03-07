const Order = require('../models/Order');
const Food = require('../models/Food');
const Category = require('../models/Category');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user')
      .populate('items.food')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    ).populate('items.food').populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalFoods = await Food.countDocuments();

    const recentOrders = await Order.find()
      .limit(10)
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('items.food');

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalFoods,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all foods (admin)
const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find().populate('category');

    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create food
const createFood = async (req, res) => {
  try {
    const { name, description, price, category, image, isVegetarian, ingredients } = req.body;

    const food = new Food({
      name,
      description,
      price,
      category,
      image,
      isVegetarian,
      ingredients,
    });

    await food.save();

    res.status(201).json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update food
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await Food.findByIdAndUpdate(id, req.body, { new: true }).populate('category');

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete food
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await Food.findByIdAndDelete(id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    const category = new Category({ name, icon, description });

    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getAllFoods,
  createFood,
  updateFood,
  deleteFood,
  getAllCategories,
  createCategory,
  getAllUsers,
};
