const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide restaurant name'],
      default: 'Rachabanda Ruchulu',
    },
    description: String,
    image: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    deliveryRadius: {
      type: Number,
      default: 5,
    },
    minOrderAmount: {
      type: Number,
      default: 100,
    },
    deliveryFee: {
      type: Number,
      default: 30,
    },
    openingHours: {
      monday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '23:00' },
      },
      tuesday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '23:00' },
      },
      wednesday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '23:00' },
      },
      thursday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '23:00' },
      },
      friday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '23:30' },
      },
      saturday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '23:30' },
      },
      sunday: {
        open: { type: String, default: '11:00' },
        close: { type: String, default: '23:00' },
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    contact: {
      phone: String,
      email: String,
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    averageRating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
