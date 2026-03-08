const Food = require('../models/Food');
const { broadcastFoodsUpdate } = require('../utils/realtime');
const { deleteImageFromCloudinary } = require('../utils/cloudinaryHelper');

// Get all foods with filters
const getAllFoods = async (req, res) => {
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

    const foods = await query;

    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured foods
const getFeaturedFoods = async (req, res) => {
  try {
    const foods = await Food.find({ isFeatured: true }).limit(8);
    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single food
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id).populate('category');

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create food (admin)
const createFood = async (req, res) => {
  try {
    const { name, description, price, category, foodType, isFeatured, ingredients, addOns, sizes } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const imageUrl = req.file ? req.file.path : null;
    
    let parsedAddOns = [];
    if (addOns) {
      try {
        parsedAddOns = JSON.parse(addOns);
      } catch (err) {
        parsedAddOns = [];
      }
    }

    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (err) {
        parsedSizes = [];
      }
    }

    const food = new Food({
      name,
      description,
      price: parseFloat(price),
      category,
      image: imageUrl,
      foodType: foodType || 'veg',
      isVegetarian: foodType && ['veg', 'vegan', 'jain', 'egg-free', 'gluten-free', 'sugar-free'].includes(foodType),
      isFeatured: isFeatured === 'true',
      ingredients: ingredients ? ingredients.split(',').map((ing) => ing.trim()) : [],
      addOns: parsedAddOns,
      sizes: parsedSizes,
    });

    await food.save();
    await food.populate('category');
    broadcastFoodsUpdate('created', food);
    res.status(201).json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update food (admin)
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, foodType, isFeatured, ingredients, addOns, sizes } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (foodType) {
      updateData.foodType = foodType;
      updateData.isVegetarian = ['veg', 'vegan', 'jain', 'egg-free', 'gluten-free', 'sugar-free'].includes(foodType);
    }
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true';
    if (ingredients) updateData.ingredients = ingredients.split(',').map((ing) => ing.trim());
    
    if (addOns) {
      try {
        updateData.addOns = JSON.parse(addOns);
      } catch (err) {
        // Keep existing addOns if parse fails
      }
    }

    if (sizes) {
      try {
        updateData.sizes = JSON.parse(sizes);
      } catch (err) {
        // Keep existing sizes if parse fails
      }
    }

    // If new image is uploaded, delete the old one
    if (req.file) {
      const existingFood = await Food.findById(id);
      if (existingFood && existingFood.image) {
        await deleteImageFromCloudinary(existingFood.image);
      }
      updateData.image = req.file.path;
    }

    const food = await Food.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('category');

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    broadcastFoodsUpdate('updated', food);
    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete food (admin)
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Delete the image from Cloudinary if it exists
    if (food.image) {
      await deleteImageFromCloudinary(food.image);
    }

    // Delete the food from database
    await Food.findByIdAndDelete(id);

    broadcastFoodsUpdate('deleted', { _id: id });
    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFoods,
  getFeaturedFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};
