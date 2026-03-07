const express = require('express');
const Category = require('../models/Category');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/uploadImage');
const { deleteImageFromCloudinary } = require('../utils/cloudinaryHelper');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Category (Admin)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const category = new Category({
      name,
      description,
      image: imageUrl,
    });

    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Category (Admin)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;

    const updateData = { name, description };

    // If new image is uploaded, delete the old one
    if (req.file) {
      const existingCategory = await Category.findById(req.params.id);
      if (existingCategory && existingCategory.image) {
        await deleteImageFromCloudinary(existingCategory.image);
      }
      updateData.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Category (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the image from Cloudinary if it exists
    if (category.image) {
      await deleteImageFromCloudinary(category.image);
    }

    // Delete the category from database
    await Category.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Category and image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
