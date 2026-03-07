const express = require('express');
const Food = require('../models/Food');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/uploadImage');
const { deleteImageFromCloudinary } = require('../utils/cloudinaryHelper');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, veg, priceMin, priceMax, sort } = req.query;

    let filter = { isAvailable: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (veg === 'true') {
      filter.isVegetarian = true;
    } else if (veg === 'false') {
      filter.isVegetarian = false;
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    let query = Food.find(filter).populate('category');

    if (sort === 'price-asc') query = query.sort({ price: 1 });
    if (sort === 'price-desc') query = query.sort({ price: -1 });
    if (sort === 'rating') query = query.sort({ rating: -1 });
    if (sort === 'newest') query = query.sort({ createdAt: -1 });

    const foods = await query.exec();

    res.json({ success: true, foods });
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const foods = await Food.find({ isFeatured: true }).limit(8);
    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/bestsellers', async (req, res) => {
  try {
    const foods = await Food.find({ isBestseller: true }).limit(8);
    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('category');
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Food (Admin)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, isVegetarian, isFeatured, ingredients } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const food = new Food({
      name,
      description,
      price: parseFloat(price),
      category,
      image: imageUrl,
      isVegetarian: isVegetarian === 'true',
      isFeatured: isFeatured === 'true',
      ingredients: ingredients ? ingredients.split(',').map((ing) => ing.trim()) : [],
    });

    await food.save();

    res.status(201).json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Food (Admin)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, isVegetarian, isFeatured, ingredients } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (isVegetarian !== undefined) updateData.isVegetarian = isVegetarian === 'true';
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true';
    if (ingredients) updateData.ingredients = ingredients.split(',').map((ing) => ing.trim());

    // If new image is uploaded, delete the old one
    if (req.file) {
      const existingFood = await Food.findById(req.params.id);
      if (existingFood && existingFood.image) {
        await deleteImageFromCloudinary(existingFood.image);
      }
      updateData.image = req.file.path;
    }

    const food = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Food (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Delete the image from Cloudinary if it exists
    if (food.image) {
      await deleteImageFromCloudinary(food.image);
    }

    // Delete the food from database
    await Food.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Food and image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
