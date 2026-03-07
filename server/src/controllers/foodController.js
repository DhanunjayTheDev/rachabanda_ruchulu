const Food = require('../models/Food');

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
    const food = await Food.findById(id).populate('category').populate('reviews');

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
    const { name, description, price, category, image, isVegetarian, isFeatured, ingredients } = req.body;

    const food = new Food({
      name,
      description,
      price,
      category,
      image,
      isVegetarian,
      isFeatured,
      ingredients,
    });

    await food.save();
    res.status(201).json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update food (admin)
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete food (admin)
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndDelete(id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

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
