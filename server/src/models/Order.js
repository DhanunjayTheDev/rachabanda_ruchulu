const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        quantity: Number,
        price: Number,
        totalPrice: Number,
        specialInstructions: String,
        selectedSize: String,
        selectedAddOns: [String],
      },
    ],
    deliveryType: {
      type: String,
      enum: ['delivery', 'takeaway'],
      required: true,
    },
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    deliveryAddressStr: String,
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: String,
    total: Number,
    paymentMethod: {
      type: String,
      enum: ['cod', 'online', 'razorpay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentId: String,
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusTimeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ deliveryLocation: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Order', orderSchema);
