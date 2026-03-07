const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/uploadImage');
const { deleteImageFromCloudinary } = require('../utils/cloudinaryHelper');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const {
  getAllQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode,
} = require('../controllers/qrController');
const {
  getAllRestaurants,
  getRestaurantById,
  getMainRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
  updateOpeningHours,
} = require('../controllers/restaurantController');

const router = express.Router();

// Admin login (no auth required)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    admin.lastLogin = Date.now();
    await admin.save();

    const token = generateToken(admin._id, 'admin');

    res.json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items.food').sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all foods for admin (with category populated)
router.get('/foods', adminAuth, async (req, res) => {
  try {
    const foods = await Food.find().populate('category').sort({ createdAt: -1 });

    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ordersStatus: status,
      },
      { new: true }
    );

    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      notes,
    });

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/foods', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, isVegetarian, isFeatured, ingredients } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const food = new Food({
      name,
      description,
      price: parseFloat(price),
      category,
      image: imageUrl,
      isVegetarian: isVegetarian === 'true',
      isFeatured: isFeatured === 'true',
      ingredients: ingredients ? JSON.parse(ingredients) : [],
    });

    await food.save();

    res.status(201).json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/foods/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, isVegetarian, isFeatured, ingredients } = req.body;

    const updateData = {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      category,
      isVegetarian: isVegetarian !== undefined ? isVegetarian === 'true' : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      ingredients: ingredients ? JSON.parse(ingredients) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Add image if uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }

    const food = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/foods/:id', adminAuth, async (req, res) => {
  try {
    const foodId = req.params.id;

    // Get the food to retrieve image URL before deleting
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Delete the image from Cloudinary if it exists
    if (food.image) {
      await deleteImageFromCloudinary(food.image);
    }

    // Delete the food from database
    await Food.findByIdAndDelete(foodId);

    // Remove from all wishlists
    await Wishlist.updateMany(
      { 'items.food': foodId },
      { $pull: { items: { food: foodId } } }
    );

    // Remove from all carts
    await Cart.updateMany(
      { 'items.food': foodId },
      { $pull: { items: { food: foodId } } }
    );

    // Recalculate subtotals for affected carts
    const affectedCarts = await Cart.find({ 'items.0': { $exists: true } });
    for (let cart of affectedCarts) {
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      await cart.save();
    }

    res.json({ success: true, message: 'Food and image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/categories', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const category = new Category({
      name,
      description,
      image: imageUrl,
    });

    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/categories/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;

    const updateData = { name, description };

    // Add image if uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const totalOrders = await require('../models/Order').countDocuments();
    const ordersToday = await require('../models/Order').countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    const totalCustomers = await require('../models/User').countDocuments();
    const revenue = await require('../models/Order').aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const categoryData = await require('../models/Food').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $project: { name: { $arrayElemAt: ['$category.name', 0] }, value: '$count' } },
    ]);

    let avgRating = 0;
    try {
      const Review = require('../models/Review');
      const ratingResult = await Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
      avgRating = ratingResult[0]?.avg || 0;
    } catch {}

    res.json({
      success: true,
      dailyRevenue: revenue[0]?.total || 0,
      revenue: revenue[0]?.total || 0,
      ordersToday,
      totalOrders,
      totalCustomers,
      avgRating,
      categoryData: categoryData.map((cat) => ({ name: cat.name, value: cat.value })) || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Revenue
router.get('/dashboard/revenue', adminAuth, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const Order = require('../models/Order');

    let groupFormat = '%Y-%m-%d'; // daily
    let daysBack = 7; // weekly default

    if (period === 'monthly') {
      groupFormat = '%Y-%m';
      daysBack = 30;
    } else if (period === 'yearly') {
      groupFormat = '%Y';
      daysBack = 365;
    }

    const isDate = (d) => d instanceof Date && !isNaN(d);
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - daysBack);

    const salesData = await Order.aggregate([
      { $match: { createdAt: { $gte: periodStart, $lte: now } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
      { $project: { date: '$_id.date', sales: 1, orders: 1, _id: 0 } },
    ]);

    res.json({ success: true, salesData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Admin Profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Admin Profile
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const updateData = {};

    if (name) updateData.name = name;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set new password' });
      }
      const adminWithPwd = await Admin.findById(req.userId).select('+password');
      const isMatch = await bcrypt.compare(currentPassword, adminWithPwd.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const admin = await Admin.findByIdAndUpdate(req.userId, updateData, { new: true }).select('-password');
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Customers (for Admin)
router.get('/customers', adminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const customers = await User.find().select('-password').limit(50);
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Payments (Admin)
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const payments = await Payment.find()
      .populate('order', 'orderId total')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Revenue Summary (Admin)
router.get('/payments/revenue', adminAuth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, today, week, month] = await Promise.all([
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: weekStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);

    const revenue = [
      { label: 'Total Revenue', total: total[0]?.total || 0 },
      { label: 'Today', total: today[0]?.total || 0 },
      { label: 'This Week', total: week[0]?.total || 0 },
      { label: 'This Month', total: month[0]?.total || 0 },
    ];
    res.json({ success: true, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Customer by ID
router.get('/customers/:id', adminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block Customer
router.put('/customers/:id/block', adminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const customer = await User.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    ).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unblock Customer
router.put('/customers/:id/unblock', adminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const customer = await User.findByIdAndUpdate(
      req.params.id, { isActive: true }, { new: true }
    ).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Reviews (for Admin)
router.get('/reviews', adminAuth, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const reviews = await Review.find().populate('user').populate('food').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Review
router.delete('/reviews/:id', adminAuth, async (req, res) => {
  try {
    const Review = require('../models/Review');
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Settings
router.get('/settings', adminAuth, getSettings);

// Update Settings
router.put('/settings', adminAuth, updateSettings);

// Restaurants Routes
// Get main restaurant
router.get('/restaurant', adminAuth, getMainRestaurant);

// Get all restaurants
router.get('/restaurants', adminAuth, getAllRestaurants);

// Get restaurant by ID
router.get('/restaurants/:id', adminAuth, getRestaurantById);

// Create restaurant
router.post('/restaurants', adminAuth, createRestaurant);

// Update restaurant
router.put('/restaurants/:id', adminAuth, updateRestaurant);

// Delete restaurant
router.delete('/restaurants/:id', adminAuth, deleteRestaurant);

// Update restaurant status (open/closed)
router.put('/restaurants/:id/status', adminAuth, updateRestaurantStatus);

// Update opening hours
router.put('/restaurants/:id/hours', adminAuth, updateOpeningHours);

// ─── QR Code Routes ───────────────────────────────────────────────────────────
router.get('/qrcodes', adminAuth, getAllQRCodes);
router.get('/qrcodes/:id', adminAuth, getQRCodeById);
router.post('/qrcodes', adminAuth, createQRCode);
router.put('/qrcodes/:id', adminAuth, updateQRCode);
router.delete('/qrcodes/:id', adminAuth, deleteQRCode);

module.exports = router;
