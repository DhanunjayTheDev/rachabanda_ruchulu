const cloudinary = require('cloudinary').v2;
const QRCode = require('../models/QRCode');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all QR codes
const getAllQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });
    res.json({ success: true, qrCodes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single QR code
const getQRCodeById = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);
    if (!qr) return res.status(404).json({ message: 'QR code not found' });
    res.json({ success: true, qr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create QR code (receives base64 image + optional logo base64)
const createQRCode = async (req, res) => {
  try {
    const {
      name,
      qrType,
      qrValue,
      fgColor,
      bgColor,
      errorCorrectionLevel,
      dotStyle,
      logoSizePercent,
      imageBase64,   // base64 of the final QR image (PNG)
      logoBase64,    // optional base64 of logo (if uploading new logo)
    } = req.body;

    if (!name || !qrValue || !imageBase64) {
      return res.status(400).json({ message: 'name, qrValue and imageBase64 are required' });
    }

    // Upload QR image to Cloudinary
    const qrUpload = await cloudinary.uploader.upload(imageBase64, {
      folder: 'rachabanda_ruchulu/qrs',
      resource_type: 'image',
    });

    // Upload logo if provided
    let logoUrl = '';
    let logoPublicId = '';
    if (logoBase64) {
      const logoUpload = await cloudinary.uploader.upload(logoBase64, {
        folder: 'rachabanda_ruchulu/qrs/logos',
        resource_type: 'image',
      });
      logoUrl = logoUpload.secure_url;
      logoPublicId = logoUpload.public_id;
    }

    const qr = await QRCode.create({
      name,
      qrType: qrType || 'website',
      qrValue,
      fgColor: fgColor || '#000000',
      bgColor: bgColor || '#FFFFFF',
      errorCorrectionLevel: errorCorrectionLevel || 'M',
      dotStyle: dotStyle || 'square',
      logoUrl,
      logoPublicId,
      logoSizePercent: logoSizePercent || 20,
      imageUrl: qrUpload.secure_url,
      publicId: qrUpload.public_id,
      createdBy: req.adminId,
    });

    res.status(201).json({ success: true, qr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update QR code (re-generates image)
const updateQRCode = async (req, res) => {
  try {
    const existing = await QRCode.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'QR code not found' });

    const {
      name,
      qrType,
      qrValue,
      fgColor,
      bgColor,
      errorCorrectionLevel,
      dotStyle,
      logoSizePercent,
      imageBase64,
      logoBase64,
    } = req.body;

    // If new QR image provided, replace old one
    let imageUrl = existing.imageUrl;
    let publicId = existing.publicId;
    if (imageBase64) {
      // Delete old QR image
      await cloudinary.uploader.destroy(existing.publicId);
      const qrUpload = await cloudinary.uploader.upload(imageBase64, {
        folder: 'rachabanda_ruchulu/qrs',
        resource_type: 'image',
      });
      imageUrl = qrUpload.secure_url;
      publicId = qrUpload.public_id;
    }

    // If new logo provided, replace old one
    let logoUrl = existing.logoUrl;
    let logoPublicId = existing.logoPublicId;
    if (logoBase64) {
      if (existing.logoPublicId) {
        await cloudinary.uploader.destroy(existing.logoPublicId);
      }
      const logoUpload = await cloudinary.uploader.upload(logoBase64, {
        folder: 'rachabanda_ruchulu/qrs/logos',
        resource_type: 'image',
      });
      logoUrl = logoUpload.secure_url;
      logoPublicId = logoUpload.public_id;
    }

    const updated = await QRCode.findByIdAndUpdate(
      req.params.id,
      {
        name: name || existing.name,
        qrType: qrType || existing.qrType,
        qrValue: qrValue || existing.qrValue,
        fgColor: fgColor ?? existing.fgColor,
        bgColor: bgColor ?? existing.bgColor,
        errorCorrectionLevel: errorCorrectionLevel || existing.errorCorrectionLevel,
        dotStyle: dotStyle || existing.dotStyle,
        logoSizePercent: logoSizePercent ?? existing.logoSizePercent,
        logoUrl,
        logoPublicId,
        imageUrl,
        publicId,
      },
      { new: true }
    );

    res.json({ success: true, qr: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE QR code — also removes from Cloudinary
const deleteQRCode = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);
    if (!qr) return res.status(404).json({ message: 'QR code not found' });

    // Delete QR image from Cloudinary
    if (qr.publicId) {
      await cloudinary.uploader.destroy(qr.publicId);
    }
    // Delete logo from Cloudinary if exists
    if (qr.logoPublicId) {
      await cloudinary.uploader.destroy(qr.logoPublicId);
    }

    await QRCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'QR code deleted from database and Cloudinary' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode,
};
