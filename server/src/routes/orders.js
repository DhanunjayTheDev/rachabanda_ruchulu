const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { generateOrderId, calculateDistance } = require('../utils/helpers');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { items: requestItems, deliveryType, deliveryAddressId, paymentMethod, couponCode, subtotal: requestSubtotal, tax: requestTax, deliveryFee: requestDeliveryFee, total: requestTotal } = req.body;

    // Use items from request body if provided, otherwise fetch from cart
    let orderItems;
    let tax, deliveryFee, subtotal;

    if (requestItems && requestItems.length > 0) {
      // Items provided in request body (contains selectedSize/selectedAddOns)
      orderItems = requestItems;
      subtotal = requestSubtotal || 0;
      tax = requestTax || 0;
      deliveryFee = requestDeliveryFee || 0;
    } else {
      // Fetch from cart (legacy path)
      const cart = await Cart.findOne({ user: req.userId }).populate('items.food');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      orderItems = cart.items.map((item) => ({
        food: item.food._id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        selectedSize: item.selectedSize,
        selectedAddOns: item.selectedAddOns,
        specialInstructions: item.specialInstructions,
      }));
      subtotal = cart.subtotal;
      tax = Math.round(cart.subtotal * 0.05);
      deliveryFee = deliveryType === 'delivery' ? 30 : 0;
    }

    // Calculate discount from coupon if provided
    let discount = 0;
    if (couponCode) {
      try {
        const Coupon = require('../models/Coupon');
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        if (coupon) {
          discount = coupon.discountType === 'percentage'
            ? Math.round((subtotal * coupon.discountValue) / 100)
            : coupon.discountValue;
        }
      } catch (err) {
        discount = 0;
      }
    }

    const total = requestTotal || Math.max(0, subtotal + tax + deliveryFee - discount);

    const order = new Order({
      orderId: generateOrderId(),
      user: req.userId,
      items: orderItems.map((item) => ({
        food: item.food?._id || item.food,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice || (item.price * item.quantity),
        selectedSize: item.selectedSize,
        selectedAddOns: item.selectedAddOns,
        specialInstructions: item.specialInstructions,
      })),
      deliveryType,
      deliveryAddress: deliveryAddressId,
      deliveryAddressStr: req.body.deliveryAddressStr,
      deliveryLocation: req.body.deliveryLocation,
      subtotal,
      tax,
      deliveryFee,
      discount,
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

    // Delete cart only if no items were provided in request (i.e., we used cart DB)
    if (!requestItems || requestItems.length === 0) {
      await Cart.findOneAndDelete({ user: req.userId });
    }

    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalOrders: 1 },
    });

    // Populate food details before returning
    await order.populate('items.food');
    await order.populate('user', 'name email phone');
    if (order.deliveryAddress) {
      await order.populate('deliveryAddress');
    }

    const { broadcastOrdersUpdate } = require('../utils/realtime');
    // For online payments, don't notify admin until payment is verified
    if (order.paymentMethod === 'cod') {
      broadcastOrdersUpdate('created', order);
    }

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
    const orders = await Order.find({ user: req.userId }).populate('items.food').populate('deliveryAddress').sort({ createdAt: -1 });

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
        status: status,
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

    // Populate necessary fields before broadcasting
    await order.populate('user', 'name email phone');
    if (order.deliveryAddress) {
      await order.populate('deliveryAddress');
    }

    const { broadcastOrdersUpdate } = require('../utils/realtime');
    broadcastOrdersUpdate('statusUpdate', order);

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
