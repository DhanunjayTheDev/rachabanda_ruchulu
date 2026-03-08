const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { broadcastOrdersUpdate } = require('../utils/realtime');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create a real Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${orderId}`,
    });

    const payment = new Payment({
      order: orderId,
      user: req.userId,
      amount,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment order created',
      paymentId: payment._id,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify', auth, async (req, res) => {
  try {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    payment.razorpayOrderId = razorpayOrderId;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'completed';

    await payment.save();

    const order = await Order.findById(payment.order);
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    order.paymentId = razorpayPaymentId;
    order.statusTimeline.push({
      status: 'confirmed',
      timestamp: new Date(),
    });

    await order.save();

    // Broadcast the order update to notify the user
    broadcastOrdersUpdate('updated', order);

    res.json({
      success: true,
      message: 'Payment verified',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
