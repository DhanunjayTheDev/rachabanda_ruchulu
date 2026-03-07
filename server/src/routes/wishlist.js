const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

// Get wishlist
router.get('/', auth, getWishlist);

// Add to wishlist
router.post('/add', auth, addToWishlist);

// Remove from wishlist
router.delete('/remove', auth, removeFromWishlist);

// Clear wishlist
router.delete('/clear', auth, clearWishlist);

module.exports = router;
