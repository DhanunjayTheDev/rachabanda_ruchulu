
import { useState, useEffect } from 'react';
import { couponsAPI, categoriesAPI, foodsAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import AdminSelect from '@/components/AdminSelect';

export default function AdminCouponsPage() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    usagePerUser: '1',
    couponType: 'general',
    appliedToAll: true,
    applicableCategories: [] as string[],
    applicableFoods: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [couponsRes, catsRes, foodsRes] = await Promise.allSettled([
          couponsAPI.getAll(),
          categoriesAPI.getAll(),
          foodsAPI.getAll(),
        ]);
        
        if (couponsRes.status === 'fulfilled') {
          setCoupons(couponsRes.value.data?.coupons || []);
        }
        if (catsRes.status === 'fulfilled') {
          setCategories(catsRes.value.data?.categories || catsRes.value.data || []);
        }
        if (foodsRes.status === 'fulfilled') {
          setFoods(foodsRes.value.data?.foods || foodsRes.value.data || []);
        }
        
        if (couponsRes.status === 'rejected' || catsRes.status === 'rejected' || foodsRes.status === 'rejected') {
          addToast('Failed to load some data', 'error', 3000);
        }
      } catch (error) {
        addToast('An error occurred while loading data', 'error', 3000);
      }
      setLoading(false);
    };
    fetchData();
  }, [addToast]);

  const filteredCoupons = coupons.filter((coupon: any) =>
    coupon.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await couponsAPI.delete(id);
      setCoupons(coupons.filter((c: any) => (c._id || c.id) !== id));
      addToast('Coupon deleted successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete coupon', 'error', 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      addToast('Please fill in all required fields', 'warning', 3000);
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        usagePerUser: parseInt(formData.usagePerUser) || 1,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        applicableCategories: formData.appliedToAll ? [] : formData.applicableCategories,
        applicableFoods: formData.appliedToAll ? [] : formData.applicableFoods,
      };

      if (editingCoupon) {
        await couponsAPI.update(editingCoupon._id || editingCoupon.id, submitData);
        setCoupons(coupons.map((c) => (c._id === editingCoupon._id || c.id === editingCoupon.id ? { ...c, ...submitData } : c)));
        addToast('Coupon updated successfully!', 'success', 3000);
      } else {
        const res = await couponsAPI.create(submitData);
        setCoupons([...coupons, res.data.coupon]);
        addToast('Coupon created successfully!', 'success', 3000);
      }

      setShowForm(false);
      setEditingCoupon(null);
      resetForm();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save coupon', 'error', 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '',
      maxDiscountAmount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      usagePerUser: '1',
      couponType: 'general',
      appliedToAll: true,
      applicableCategories: [],
      applicableFoods: [],
      isActive: true,
    });
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderValue: String(coupon.minOrderValue || ''),
      maxDiscountAmount: String(coupon.maxDiscountAmount || ''),
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validUntil: coupon.validUntil?.split('T')[0] || '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      usagePerUser: String(coupon.usagePerUser || 1),
      couponType: coupon.couponType,
      appliedToAll: coupon.appliedToAll,
      applicableCategories: coupon.applicableCategories?.map((c: any) => c._id || c) || [],
      applicableFoods: coupon.applicableFoods?.map((f: any) => f._id || f) || [],
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Coupon <span className="text-primary-gold">Management</span></h1>
            <button
              onClick={() => {
                setEditingCoupon(null);
                resetForm();
                setShowForm(true);
              }}
              className="btn btn-primary"
            >
              + Add New Coupon
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">🎟️</div>
            <div className="stat-card-value text-primary-gold">{coupons.length}</div>
            <p className="stat-card-label">Total Coupons</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{coupons.filter((c: any) => c.isActive).length}</div>
            <p className="stat-card-label">Active</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-red-500/10 text-red-400">✕</div>
            <div className="stat-card-value text-red-400">{coupons.filter((c: any) => !c.isActive).length}</div>
            <p className="stat-card-label">Inactive</p>
          </div>
        </div>

        <div className="card mb-8">
          <div>
            <label className="block text-sm font-semibold mb-2">Search by Code</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coupons..."
              className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
            />
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading coupons...</div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-6 py-4 text-left font-semibold">Code</th>
                    <th className="px-6 py-4 text-left font-semibold">Discount</th>
                    <th className="px-6 py-4 text-left font-semibold">Valid Till</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon: any) => (
                    <tr key={coupon._id || coupon.id} className="border-b border-gray-600 hover:bg-dark-input/50 transition-colors">
                      <td className="px-6 py-4 font-semibold">{coupon.code}</td>
                      <td className="px-6 py-4">
                        <span className="text-primary-gold font-bold">
                          {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '₹'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            coupon.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {coupon.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="px-3 py-1 rounded text-sm bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id || coupon.id)}
                            className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredCoupons.length === 0 && <div className="text-center py-12 text-gray-400">No coupons found</div>}
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="modal-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAVE20"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Discount Type</label>
                  <AdminSelect
                    value={formData.discountType}
                    onChange={(v) => setFormData({ ...formData, discountType: v })}
                    options={[
                      { value: 'percentage', label: 'Percentage (%)' },
                      { value: 'fixed', label: 'Fixed Amount (₹)' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="e.g., 20"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Coupon Type</label>
                  <AdminSelect
                    value={formData.couponType}
                    onChange={(v) => setFormData({ ...formData, couponType: v })}
                    options={[
                      { value: 'general', label: 'General' },
                      { value: 'first-time-user', label: 'First-Time User' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Min Order Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Max Discount Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Valid From *</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Valid Until *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Usage Limit per User</label>
                  <input
                    type="number"
                    value={formData.usagePerUser}
                    onChange={(e) => setFormData({ ...formData, usagePerUser: e.target.value })}
                    placeholder="Default: 1"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Optional (unlimited if empty)"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter coupon description"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.appliedToAll}
                    onChange={(e) => setFormData({ ...formData, appliedToAll: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">Apply to all categories & foods</span>
                </label>
              </div>

              {!formData.appliedToAll && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Applicable Categories</label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {categories.map((cat: any) => (
                        <label key={cat._id || cat.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applicableCategories.includes(cat._id || cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  applicableCategories: [...formData.applicableCategories, cat._id || cat.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableCategories: formData.applicableCategories.filter(
                                    (id) => id !== (cat._id || cat.id)
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Applicable Foods</label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {foods.map((food: any) => (
                        <label key={food._id || food.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applicableFoods.includes(food._id || food.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  applicableFoods: [...formData.applicableFoods, food._id || food.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableFoods: formData.applicableFoods.filter(
                                    (id) => id !== (food._id || food.id)
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{food.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">Active</span>
                </label>
              </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCoupon(null);
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
