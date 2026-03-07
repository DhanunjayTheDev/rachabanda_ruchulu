const express = require('express');
const router = express.Router();

// Create Contact Form Submission
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // In a production app, you'd send an email here
    // For now, we'll just log it or store it in a database

    // Optional: Store in database if you create a Contact model
    const Contact = require('../models/Contact');
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Contact Submissions (Admin)
router.get('/', async (req, res) => {
  try {
    const Contact = require('../models/Contact');
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
