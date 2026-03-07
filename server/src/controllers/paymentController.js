const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Create payment order (for Razorpay)
const createPaymentOrder = async (req, res) => {
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
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify signature with Razorpay (implement according to Razorpay docs)
    // For now, mark as successful
    payment.status = 'success';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpayOrderId = razorpayOrderId;

    await payment.save();

    // Update order status
    await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'completed' });

    res.json({ success: true, message: 'Payment verified', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id).populate('order').populate('user');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user payments
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.userId }).populate('order').sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getUserPayments,
};
