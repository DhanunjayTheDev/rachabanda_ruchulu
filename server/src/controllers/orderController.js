const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { generateOrderId } = require('../utils/helpers');

// Create order
const createOrder = async (req, res) => {
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
      subtotal: cart.subtotal,
      tax,
      deliveryFee,
      total,
      deliveryType,
      deliveryAddress: deliveryAddressId,
      paymentMethod,
      couponCode,
      status: 'pending',
    });

    await order.save();

    await Cart.findByIdAndUpdate(cart._id, { items: [] });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate('items.food').sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('items.food').populate('user').populate('deliveryAddress');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
