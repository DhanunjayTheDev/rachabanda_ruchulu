const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide announcement title'],
    },
    description: String,
    image: String,
    type: {
      type: String,
      enum: ['offer', 'event', 'special-occasion', 'general'],
      default: 'general',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    discountPercentage: Number,
    priority: {
      type: Number,
      default: 0,
    },
    targetFoods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
      },
    ],
    targetCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    appliedToAll: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);
