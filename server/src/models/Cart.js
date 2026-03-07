const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: Number,
        totalPrice: Number,
        selectedSize: String,
        selectedAddOns: [String],
        specialInstructions: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cart', cartSchema);
