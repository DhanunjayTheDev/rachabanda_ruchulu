const Restaurant = require('../models/Restaurant');

// Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json({ success: true, restaurants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get main restaurant (first one)
const getMainRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();

    // Create default if doesn't exist
    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: 'Rachabanda Ruchulu',
        description: 'Authentic Telugu Cuisine',
        location: {
          type: 'Point',
          coordinates: [0, 0], // Default coordinates, should be updated
        },
        deliveryRadius: 5,
        minOrderAmount: 100,
        deliveryFee: 30,
        isOpen: true,
        contact: {
          phone: '+91-XXXXXXXXXX',
          email: 'info@rachabanda.com',
        },
      });
    }

    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create restaurant
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      latitude,
      longitude,
      deliveryRadius,
      minOrderAmount,
      deliveryFee,
      phone,
      email,
      facebook,
      instagram,
      twitter,
      isOpen,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Restaurant name is required' });
    }

    const restaurantData = {
      name,
      description: description || '',
      image: image || null,
      location: {
        type: 'Point',
        coordinates: [longitude ? parseFloat(longitude) : 0, latitude ? parseFloat(latitude) : 0],
      },
      deliveryRadius: deliveryRadius ? parseFloat(deliveryRadius) : 5,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 100,
      deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 30,
      isOpen: isOpen !== undefined ? isOpen : true,
      contact: {
        phone: phone || '',
        email: email || '',
      },
      socialLinks: {
        facebook: facebook || '',
        instagram: instagram || '',
        twitter: twitter || '',
      },
    };

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update restaurant
const updateRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      latitude,
      longitude,
      deliveryRadius,
      minOrderAmount,
      deliveryFee,
      phone,
      email,
      facebook,
      instagram,
      twitter,
      isOpen,
      openingHours,
    } = req.body;

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update only provided fields
    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (image !== undefined) restaurant.image = image;
    if (latitude !== undefined || longitude !== undefined) {
      restaurant.location = {
        type: 'Point',
        coordinates: [
          longitude ? parseFloat(longitude) : restaurant.location.coordinates[0],
          latitude ? parseFloat(latitude) : restaurant.location.coordinates[1],
        ],
      };
    }
    if (deliveryRadius !== undefined) restaurant.deliveryRadius = parseFloat(deliveryRadius);
    if (minOrderAmount !== undefined) restaurant.minOrderAmount = parseFloat(minOrderAmount);
    if (deliveryFee !== undefined) restaurant.deliveryFee = parseFloat(deliveryFee);
    if (isOpen !== undefined) restaurant.isOpen = isOpen;
    if (phone !== undefined) restaurant.contact.phone = phone;
    if (email !== undefined) restaurant.contact.email = email;
    if (facebook !== undefined) restaurant.socialLinks.facebook = facebook;
    if (instagram !== undefined) restaurant.socialLinks.instagram = instagram;
    if (twitter !== undefined) restaurant.socialLinks.twitter = twitter;
    if (openingHours !== undefined) restaurant.openingHours = openingHours;

    await restaurant.save();

    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete restaurant
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update restaurant status
const updateRestaurantStatus = async (req, res) => {
  try {
    const { isOpen } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isOpen },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update opening hours
const updateOpeningHours = async (req, res) => {
  try {
    const { openingHours } = req.body;

    if (!openingHours) {
      return res.status(400).json({ message: 'Opening hours are required' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { openingHours },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getMainRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
  updateOpeningHours,
};
