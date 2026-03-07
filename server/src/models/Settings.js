const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, default: 'Rachabanda Ruchulu' },
    tagline: { type: String, default: 'Authentic Telugu Cuisine' },
    email: { type: String, default: 'info@rachabanda.com' },
    phone: { type: String },
    address: { type: String },
    deliveryRadius: { type: Number, default: 15 },
    minimumOrder: { type: Number, default: 200 },
    deliveryCharge: { type: Number, default: 40 },
    freeDeliveryAbove: { type: Number, default: 500 },
    taxRate: { type: Number, default: 5 },
    openTime: { type: String, default: '10:00' },
    closeTime: { type: String, default: '23:00' },
    isOpen: { type: Boolean, default: true },
    acceptOnlinePayments: { type: Boolean, default: true },
    acceptCOD: { type: Boolean, default: true },
    bankDetails: { type: String },
    upiId: { type: String },
    aboutUs: { type: String },
    privacyPolicy: { type: String },
    termsConditions: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
