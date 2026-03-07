'use client';

import { useState, useEffect } from 'react';
import { announcementsAPI, categoriesAPI, foodsAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import AdminSelect from '@/components/AdminSelect';

export default function AdminAnnouncementsPage() {
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'promotion',
    discountPercentage: '',
    priority: '0',
    startDate: '',
    endDate: '',
    appliedToAll: true,
    targetFoods: [] as string[],
    targetCategories: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, catsRes, foodsRes] = await Promise.allSettled([
          announcementsAPI.getAll(),
          categoriesAPI.getAll(),
          foodsAPI.getAll(),
        ]);

        if (announcementsRes.status === 'fulfilled') {
          setAnnouncements(announcementsRes.value.data?.announcements || []);
        }
        if (catsRes.status === 'fulfilled') {
          setCategories(catsRes.value.data?.categories || catsRes.value.data || []);
        }
        if (foodsRes.status === 'fulfilled') {
          setFoods(foodsRes.value.data?.foods || foodsRes.value.data || []);
        }

        if (announcementsRes.status === 'rejected' || catsRes.status === 'rejected' || foodsRes.status === 'rejected') {
          addToast('Failed to load some data', 'error', 3000);
        }
      } catch (error) {
        addToast('An error occurred while loading data', 'error', 3000);
      }
      setLoading(false);
    };
    fetchData();
  }, [addToast]);

  const filteredAnnouncements = announcements.filter((announcement: any) =>
    announcement.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementsAPI.delete(id);
      setAnnouncements(announcements.filter((a: any) => (a._id || a.id) !== id));
      addToast('Announcement deleted successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete announcement', 'error', 3000);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate) {
      addToast('Please fill in all required fields', 'warning', 3000);
      return;
    }

    setSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('type', formData.type);
      formDataObj.append('discountPercentage', formData.discountPercentage);
      formDataObj.append('priority', formData.priority);
      formDataObj.append('startDate', formData.startDate);
      formDataObj.append('endDate', formData.endDate);
      formDataObj.append('appliedToAll', String(formData.appliedToAll));
      formDataObj.append('isActive', String(formData.isActive));

      if (!formData.appliedToAll) {
        formDataObj.append('targetFoods', JSON.stringify(formData.targetFoods));
        formDataObj.append('targetCategories', JSON.stringify(formData.targetCategories));
      }

      const imageInput = document.getElementById('announcementImage') as HTMLInputElement;
      if (imageInput?.files?.[0]) {
        formDataObj.append('image', imageInput.files[0]);
      }

      if (editingAnnouncement) {
        await announcementsAPI.update(editingAnnouncement._id || editingAnnouncement.id, formDataObj);
        setAnnouncements(
          announcements.map((a) =>
            a._id === editingAnnouncement._id || a.id === editingAnnouncement.id
              ? { ...a, ...formData }
              : a
          )
        );
        addToast('Announcement updated successfully!', 'success', 3000);
      } else {
        const res = await announcementsAPI.create(formDataObj);
        setAnnouncements([...announcements, res.data.announcement]);
        addToast('Announcement created successfully!', 'success', 3000);
      }

      setShowForm(false);
      setEditingAnnouncement(null);
      resetForm();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save announcement', 'error', 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'promotion',
      discountPercentage: '',
      priority: '0',
      startDate: '',
      endDate: '',
      appliedToAll: true,
      targetFoods: [],
      targetCategories: [],
      isActive: true,
    });
    setImagePreview('');
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      type: announcement.type,
      discountPercentage: String(announcement.discountPercentage || ''),
      priority: String(announcement.priority || 0),
      startDate: announcement.startDate?.split('T')[0] || '',
      endDate: announcement.endDate?.split('T')[0] || '',
      appliedToAll: announcement.appliedToAll,
      targetFoods: announcement.targetFoods?.map((f: any) => f._id || f) || [],
      targetCategories: announcement.targetCategories?.map((c: any) => c._id || c) || [],
      isActive: announcement.isActive,
    });
    setImagePreview(announcement.image || '');
    setShowForm(true);
  };

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Announcement <span className="text-primary-gold">Management</span></h1>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                resetForm();
                setShowForm(true);
              }}
              className="btn btn-primary"
            >
              + Add New Announcement
            </button>
          </div>
        </div>

        <div className="card mb-8">
          <div>
            <label className="block text-sm font-semibold mb-2">Search by Title</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search announcements..."
              className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">📢</div>
            <div className="stat-card-value text-primary-gold">{announcements.length}</div>
            <p className="stat-card-label">Total Announcements</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{announcements.filter((a: any) => a.isActive).length}</div>
            <p className="stat-card-label">Active</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-red-500/10 text-red-400">✕</div>
            <div className="stat-card-value text-red-400">{announcements.filter((a: any) => !a.isActive).length}</div>
            <p className="stat-card-label">Inactive</p>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading announcements...</div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-6 py-4 text-left font-semibold">Title</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Period</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnouncements.map((announcement: any) => (
                    <tr key={announcement._id || announcement.id} className="border-b border-gray-600 hover:bg-dark-input/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {announcement.image?.startsWith('http') ? (
                            <img src={announcement.image} alt={announcement.title} className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <span className="text-2xl">📢</span>
                          )}
                          <span className="font-semibold">{announcement.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{announcement.type}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(announcement.startDate).toLocaleDateString()} -
                        <br />
                        {new Date(announcement.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            announcement.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {announcement.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="px-3 py-1 rounded text-sm bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(announcement._id || announcement.id)}
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
          {!loading && filteredAnnouncements.length === 0 && (
            <div className="text-center py-12 text-gray-400">No announcements found</div>
          )}
        </div>
      </div>

      {/* Announcement Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="modal-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter announcement title"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <AdminSelect
                    value={formData.type}
                    onChange={(v) => setFormData({ ...formData, type: v })}
                    options={[
                      { value: 'promotion', label: 'Promotion' },
                      { value: 'announcement', label: 'Announcement' },
                      { value: 'news', label: 'News' },
                      { value: 'discount', label: 'Discount Offer' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Discount Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter announcement description"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Image</label>
                <div className="flex gap-4 items-start">
                  <input
                    id="announcementImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded object-cover" />
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.appliedToAll}
                    onChange={(e) => setFormData({ ...formData, appliedToAll: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">Apply to all foods & categories</span>
                </label>
              </div>

              {!formData.appliedToAll && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Target Categories</label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {categories.map((cat: any) => (
                        <label key={cat._id || cat.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.targetCategories.includes(cat._id || cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  targetCategories: [...formData.targetCategories, cat._id || cat.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  targetCategories: formData.targetCategories.filter(
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
                    <label className="block text-sm font-semibold mb-2">Target Foods</label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {foods.map((food: any) => (
                        <label key={food._id || food.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.targetFoods.includes(food._id || food.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  targetFoods: [...formData.targetFoods, food._id || food.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  targetFoods: formData.targetFoods.filter(
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
                  {submitting ? 'Saving...' : editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAnnouncement(null);
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
