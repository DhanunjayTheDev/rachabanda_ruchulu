const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { broadcastCouponsUpdate } = require('../utils/realtime');

// Get available coupons for user (with first-time special coupon)
const getAvailableCoupons = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const now = new Date();

    let query = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    };

    // If first-time user, include first-time coupons
    if (user && user.totalOrders === 0) {
      query.$or = [
        { couponType: { $ne: 'first-time-user' } },
        { couponType: 'first-time-user' },
      ];
    } else {
      query.couponType = { $ne: 'first-time-user' };
    }

    const coupons = await Coupon.find(query)
      .populate('applicableCategories', 'name')
      .populate('applicableFoods', 'name')
      .sort({ priority: -1 })
      .limit(20);

    // Mark which ones the user has already used
    const enhanced = coupons.map((coupon) => {
      const usageByUser = coupon.usedBy.filter((use) => use.userId.toString() === req.userId);
      return {
        ...coupon.toObject(),
        isFirstTimeUser: !user || user.totalOrders === 0,
        userUsageCount: usageByUser.length,
        canUse: usageByUser.length < (coupon.usagePerUser || 1),
      };
    });

    res.json({ success: true, coupons: enhanced });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all coupons (Admin)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('applicableCategories', 'name')
      .populate('applicableFoods', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single coupon by ID
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableCategories', 'name')
      .populate('applicableFoods', 'name');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Coupon (Admin)
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      usagePerUser,
      couponType,
      appliedToAll,
      applicableCategories,
      applicableFoods,
      isActive,
    } = req.body;

    if (!code || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({ message: 'Code, discount value, and dates are required' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      usagePerUser: usagePerUser ? parseInt(usagePerUser) : 1,
      couponType,
      appliedToAll: appliedToAll === true || appliedToAll === 'true',
      applicableCategories: appliedToAll === true || appliedToAll === 'true' ? [] : applicableCategories || [],
      applicableFoods: appliedToAll === true || appliedToAll === 'true' ? [] : applicableFoods || [],
      isActive: isActive !== false,
    });

    await coupon.save();
    broadcastCouponsUpdate('created', coupon);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Coupon (Admin)
const updateCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      usagePerUser,
      couponType,
      appliedToAll,
      applicableCategories,
      applicableFoods,
      isActive,
    } = req.body;

    const updateData = {};
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue) updateData.discountValue = parseFloat(discountValue);
    if (minOrderValue !== undefined) updateData.minOrderValue = parseFloat(minOrderValue);
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    if (validFrom) updateData.validFrom = new Date(validFrom);
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (usagePerUser !== undefined) updateData.usagePerUser = parseInt(usagePerUser);
    if (couponType) updateData.couponType = couponType;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (appliedToAll !== undefined) {
      updateData.appliedToAll = appliedToAll === true || appliedToAll === 'true';
      updateData.applicableCategories = appliedToAll === true || appliedToAll === 'true' ? [] : (applicableCategories || []);
      updateData.applicableFoods = appliedToAll === true || appliedToAll === 'true' ? [] : (applicableFoods || []);
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('applicableCategories', 'name')
      .populate('applicableFoods', 'name');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    broadcastCouponsUpdate('updated', coupon);
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Coupon (Admin)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    broadcastCouponsUpdate('deleted', { _id: req.params.id });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify and apply coupon
const verifyCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const now = new Date();

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      });
    }

    // Check usage limits
    if (coupon.usageLimit) {
      const totalUsage = coupon.usedBy.length;
      if (totalUsage >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit exceeded' });
      }
    }

    // Check per-user usage limit
    if (req.userId) {
      const userUsage = coupon.usedBy.filter((u) => u.userId.toString() === req.userId);
      if (userUsage.length >= coupon.usagePerUser) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderValue * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableCoupons,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  verifyCoupon,
};
