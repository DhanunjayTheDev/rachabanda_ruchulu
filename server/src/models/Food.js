const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food name'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    actualPrice: {
      type: Number,
      description: 'Original price before discount',
    },
    offerPrice: {
      type: Number,
      description: 'Discounted/Offer price',
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: {
      type: Number,
    },
    image: {
      type: String,
      required: true,
    },
    images: [String],
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    ingredients: [String],
    preparationTime: {
      type: Number,
      default: 30,
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'very-hot'],
      default: 'medium',
    },
    calories: Number,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    sizes: [
      {
        name: String,
        label: String,
        actualPrice: Number,
        offerPrice: Number,
      },
    ],
    addOns: [
      {
        name: String,
        price: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Food', foodSchema);
