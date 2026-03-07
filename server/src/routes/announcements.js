const express = require('express');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/uploadImage');
const {
  getActiveAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

const router = express.Router();

// Get Active Announcements (Public)
router.get('/', getActiveAnnouncements);

// Get all announcements for admin
router.get('/admin/all', adminAuth, getAllAnnouncements);

// Get single announcement
router.get('/:id', getAnnouncementById);

// Create Announcement (Admin)
router.post('/', adminAuth, upload.single('image'), createAnnouncement);

// Update Announcement (Admin)
router.put('/:id', adminAuth, upload.single('image'), updateAnnouncement);

// Delete Announcement (Admin)
router.delete('/:id', adminAuth, deleteAnnouncement);

module.exports = router;
