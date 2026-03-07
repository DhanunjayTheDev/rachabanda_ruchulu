const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAvailableCoupons,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  verifyCoupon,
} = require('../controllers/couponController');

const router = express.Router();

// Get available coupons for user
router.get('/', auth, getAvailableCoupons);

// Get all coupons (Admin)
router.get('/admin/all', adminAuth, getAllCoupons);

// Get single coupon by ID
router.get('/:id', getCouponById);

// Verify coupon
router.post('/verify', auth, verifyCoupon);

// Create Coupon (Admin)
router.post('/', adminAuth, createCoupon);

// Update Coupon (Admin)
router.put('/:id', adminAuth, updateCoupon);

// Delete Coupon (Admin)
router.delete('/:id', adminAuth, deleteCoupon);

module.exports = router;
