const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { generateOrderId, calculateDistance } = require('../utils/helpers');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { deliveryType, deliveryAddressId, paymentMethod, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.userId }).populate('items.food');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const tax = Math.round(cart.subtotal * 0.05);
    const deliveryFee = deliveryType === 'delivery' ? 30 : 0;
    const total = cart.subtotal + tax + deliveryFee;

    const order = new Order({
      orderId: generateOrderId(),
      user: req.userId,
      items: cart.items.map((item) => ({
        food: item.food._id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
      })),
      deliveryType,
      deliveryAddress: deliveryAddressId,
      subtotal: cart.subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod,
      couponCode,
      statusTimeline: [
        {
          status: 'placed',
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    await Cart.findOneAndDelete({ user: req.userId });

    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalOrders: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate('items.food').sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.food').populate('user').populate('deliveryAddress');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Order Status (Admin Only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ordersStatus: status,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

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

module.exports = router;
