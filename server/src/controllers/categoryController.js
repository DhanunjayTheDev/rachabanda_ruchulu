const Category = require('../models/Category');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single category
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category (admin)
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    const category = new Category({
      name,
      icon,
      description,
    });

    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category (admin)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category (admin)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
