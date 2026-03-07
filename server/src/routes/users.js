const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Address = require('../models/Address');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('addresses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
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
});

router.post('/addresses', auth, async (req, res) => {
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
});

router.get('/addresses', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.userId });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/addresses/:id', auth, async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/addresses/:id', auth, async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.userId, {
      $pull: { addresses: req.params.id },
    });

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
