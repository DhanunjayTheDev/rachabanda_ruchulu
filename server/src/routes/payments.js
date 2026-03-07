const express = require('express');
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const router = express.Router();

router.post('/create-order', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const payment = new Payment({
      order: orderId,
      user: req.userId,
      amount,
      paymentMethod: 'razorpay',
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment order created',
      paymentId: payment._id,
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

    payment.razorpayOrderId = razorpayOrderId;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'completed';

    await payment.save();

    const order = await Order.findById(payment.order);
    order.paymentStatus = 'completed';
    order.ordersStatus = 'confirmed';
    order.statusTimeline.push({
      status: 'confirmed',
      timestamp: new Date(),
    });

    await order.save();

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
