const express = require('express');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/uploadImage');
const { 
  getAllFoods, 
  getFeaturedFoods, 
  getFoodById, 
  createFood, 
  updateFood, 
  deleteFood 
} = require('../controllers/foodController');

const router = express.Router();

// Public endpoints
router.get('/', getAllFoods);
router.get('/featured', getFeaturedFoods);
router.get('/bestsellers', async (req, res) => {
  try {
    const Food = require('../models/Food');
    const foods = await Food.find({ isBestseller: true }).limit(8);
    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/:id', getFoodById);

// Admin endpoints
router.post('/', adminAuth, upload.single('image'), createFood);
router.put('/:id', adminAuth, upload.single('image'), updateFood);
router.delete('/:id', adminAuth, deleteFood);

module.exports = router;
