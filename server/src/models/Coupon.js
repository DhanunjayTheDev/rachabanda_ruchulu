const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: Number,
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      description: 'Total times coupon can be used',
    },
    usagePerUser: {
      type: Number,
      default: 1,
      description: 'How many times a user can use this coupon',
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applicableFoods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
      },
    ],
    appliedToAll: {
      type: Boolean,
      default: false,
    },
    couponType: {
      type: String,
      enum: ['general', 'first-time-user', 'seasonal', 'bulk-purchase'],
      default: 'general',
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
