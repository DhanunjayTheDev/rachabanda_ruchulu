const Settings = require('../models/Settings');

// Get Settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Settings
const updateSettings = async (req, res) => {
  try {
    const {
      restaurantName,
      tagline,
      email,
      phone,
      address,
      deliveryRadius,
      minimumOrder,
      deliveryCharge,
      freeDeliveryAbove,
      taxRate,
      openTime,
      closeTime,
      isOpen,
      acceptOnlinePayments,
      acceptCOD,
      bankDetails,
      upiId,
      aboutUs,
      privacyPolicy,
      termsConditions,
    } = req.body;

    const updateData = {};

    if (restaurantName !== undefined) updateData.restaurantName = restaurantName;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (deliveryRadius !== undefined) updateData.deliveryRadius = parseFloat(deliveryRadius);
    if (minimumOrder !== undefined) updateData.minimumOrder = parseFloat(minimumOrder);
    if (deliveryCharge !== undefined) updateData.deliveryCharge = parseFloat(deliveryCharge);
    if (freeDeliveryAbove !== undefined) updateData.freeDeliveryAbove = parseFloat(freeDeliveryAbove);
    if (taxRate !== undefined) updateData.taxRate = parseFloat(taxRate);
    if (openTime !== undefined) updateData.openTime = openTime;
    if (closeTime !== undefined) updateData.closeTime = closeTime;
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    if (acceptOnlinePayments !== undefined) updateData.acceptOnlinePayments = acceptOnlinePayments;
    if (acceptCOD !== undefined) updateData.acceptCOD = acceptCOD;
    if (bankDetails !== undefined) updateData.bankDetails = bankDetails;
    if (upiId !== undefined) updateData.upiId = upiId;
    if (aboutUs !== undefined) updateData.aboutUs = aboutUs;
    if (privacyPolicy !== undefined) updateData.privacyPolicy = privacyPolicy;
    if (termsConditions !== undefined) updateData.termsConditions = termsConditions;

    let settings = await Settings.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
