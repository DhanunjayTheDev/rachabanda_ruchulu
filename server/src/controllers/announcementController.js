const Announcement = require('../models/Announcement');

// Get Active Announcements (Public)
const getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('targetFoods', 'name')
      .populate('targetCategories', 'name')
      .sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all announcements for admin
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('targetFoods', 'name')
      .populate('targetCategories', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('targetFoods', 'name')
      .populate('targetCategories', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Announcement (Admin)
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      discountPercentage,
      priority,
      appliedToAll,
      targetFoods,
      targetCategories,
      isActive,
    } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, start date, and end date are required' });
    }

    const announcement = new Announcement({
      title,
      description,
      image: req.file ? req.file.path : null,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      discountPercentage: discountPercentage ? parseFloat(discountPercentage) : null,
      priority: priority ? parseInt(priority) : 0,
      appliedToAll: appliedToAll === true || appliedToAll === 'true',
      targetFoods: appliedToAll === true || appliedToAll === 'true' ? [] : targetFoods || [],
      targetCategories: appliedToAll === true || appliedToAll === 'true' ? [] : targetCategories || [],
      isActive: isActive !== false,
    });

    await announcement.save();
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Announcement (Admin)
const updateAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      discountPercentage,
      priority,
      appliedToAll,
      targetFoods,
      targetCategories,
      isActive,
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage ? parseFloat(discountPercentage) : null;
    if (priority !== undefined) updateData.priority = parseInt(priority);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (appliedToAll !== undefined) {
      updateData.appliedToAll = appliedToAll === true || appliedToAll === 'true';
      updateData.targetFoods = appliedToAll === true || appliedToAll === 'true' ? [] : (targetFoods || []);
      updateData.targetCategories = appliedToAll === true || appliedToAll === 'true' ? [] : (targetCategories || []);
    }
    if (req.file) updateData.image = req.file.path;

    const announcement = await Announcement.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('targetFoods', 'name')
      .populate('targetCategories', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Announcement (Admin)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
