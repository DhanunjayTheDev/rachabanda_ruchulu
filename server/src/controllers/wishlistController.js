const Wishlist = require('../models/Wishlist');
const Food = require('../models/Food');

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.userId }).populate('items.food');

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.userId, items: [] });
      await wishlist.save();
    }

    // Filter out deleted items (where food is null)
    const validItems = wishlist.items.filter((item) => item.food !== null);
    const hasDeletedItems = validItems.length !== wishlist.items.length;

    if (hasDeletedItems) {
      // Remove deleted items from database
      wishlist.items = validItems;
      await wishlist.save();
    }

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { foodId } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.userId, items: [] });
    }

    // Check if item already exists
    const existingItem = wishlist.items.find((item) => item.food.toString() === foodId);

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    wishlist.items.push({ food: foodId });
    await wishlist.save();

    const fullWishlist = await Wishlist.findById(wishlist._id).populate('items.food');

    res.json({ success: true, wishlist: fullWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { foodId } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter((item) => item.food.toString() !== foodId);
    await wishlist.save();

    const fullWishlist = await Wishlist.findById(wishlist._id).populate('items.food');

    res.json({ success: true, wishlist: fullWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.userId },
      { items: [] },
      { new: true }
    ).populate('items.food');

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
