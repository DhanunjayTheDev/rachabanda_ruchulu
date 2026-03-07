const Cart = require('../models/Cart');
const Food = require('../models/Food');

// Get cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate('items.food');

    if (!cart) {
      cart = new Cart({ user: req.userId, items: [], subtotal: 0 });
      await cart.save();
    }

    // Filter out deleted items (where food is null)
    const validItems = cart.items.filter((item) => item.food !== null);
    const hasDeletedItems = validItems.length !== cart.items.length;

    if (hasDeletedItems) {
      // Remove deleted items from database
      cart.items = validItems;
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      await cart.save();
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { foodId, quantity, price } = req.body;

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.food.toString() === foodId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * price;
    } else {
      cart.items.push({
        food: foodId,
        quantity,
        price,
        totalPrice: quantity * price,
      });
    }

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate('items.food');

    res.json({ success: true, cart: fullCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.body;

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.food.toString() !== foodId);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate('items.food');

    res.json({ success: true, cart: fullCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { foodId, quantity, price } = req.body;

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((item) => item.food.toString() === foodId);

    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = quantity;
    item.totalPrice = quantity * price;

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    const fullCart = await Cart.findById(cart._id).populate('items.food');

    res.json({ success: true, cart: fullCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.subtotal = 0;
    await cart.save();

    res.json({ success: true, message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
};
