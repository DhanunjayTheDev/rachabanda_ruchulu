const User = require('../models/User');
const Address = require('../models/Address');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('addresses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const address = new Address({
      ...req.body,
      user: req.userId,
    });

    await address.save();

    await User.findByIdAndUpdate(req.userId, {
      $push: { addresses: address._id },
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, fullAddress, isDefault } = req.body;

    const address = await Address.findByIdAndUpdate(
      id,
      { label, fullAddress, isDefault },
      { new: true }
    );

    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    await Address.findByIdAndDelete(id);

    await User.findByIdAndUpdate(req.userId, {
      $pull: { addresses: id },
    });

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.userId });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
};
