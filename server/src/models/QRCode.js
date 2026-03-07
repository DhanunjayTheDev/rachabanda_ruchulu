const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qrType: {
      type: String,
      enum: ['website', 'phone', 'menu', 'custom'],
      default: 'website',
    },
    qrValue: { type: String, required: true },
    // Design customization
    fgColor: { type: String, default: '#000000' },
    bgColor: { type: String, default: '#FFFFFF' },
    errorCorrectionLevel: { type: String, enum: ['L', 'M', 'Q', 'H'], default: 'M' },
    dotStyle: { type: String, enum: ['square', 'rounded', 'dots', 'classy'], default: 'square' },
    // Logo in center
    logoUrl: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    logoSizePercent: { type: Number, default: 20 },
    // Saved QR image
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    // Meta
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRCode', qrCodeSchema);
