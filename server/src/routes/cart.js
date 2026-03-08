const express = require('express');
const { auth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Food = require('../models/Food');

const router = express.Router();

router.post('/add', auth, async (req, res) => {
  try {
    const { foodId, quantity, price, selectedSize, selectedAddOns, specialInstructions } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    // Normalize selectedAddOns: treat undefined, null, and [] as equivalent
    const normalizeAddOns = (addOns) =>
      Array.isArray(addOns) && addOns.length > 0 ? JSON.stringify([...addOns].sort()) : '[]';

    const existingItem = cart.items.find(
      (item) =>
        item.food.toString() === foodId &&
        (item.selectedSize || '') === (selectedSize || '') &&
        normalizeAddOns(item.selectedAddOns) === normalizeAddOns(selectedAddOns)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = (price || food.price) * existingItem.quantity;
    } else {
      cart.items.push({
        food: foodId,
        quantity,
        price: price || food.price,
        selectedSize,
        selectedAddOns,
        specialInstructions,
        totalPrice: (price || food.price) * quantity,
      });
    }

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate('items.food');
    res.json({ success: true, cart: fullCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('items.food');
    if (!cart) {
      return res.json({ success: true, cart: { items: [], subtotal: 0 } });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity, price, selectedSize, selectedAddOns, specialInstructions } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update all provided fields
    if (quantity !== undefined) item.quantity = quantity;
    if (price !== undefined) item.price = price;
    if (selectedSize !== undefined) item.selectedSize = selectedSize;
    if (selectedAddOns !== undefined) item.selectedAddOns = selectedAddOns;
    if (specialInstructions !== undefined) item.specialInstructions = specialInstructions;

    // Recalculate total price
    item.totalPrice = item.price * item.quantity;

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate('items.food');
    res.json({ success: true, cart: fullCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate('items.food');
    res.json({ success: true, cart: fullCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.userId });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
