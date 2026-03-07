'use client';

import { useState, useEffect } from 'react';
import { restaurantsAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

export default function AdminRestaurantPage() {
  const { addToast } = useToast();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
    deliveryRadius: '5',
    minOrderAmount: '100',
    deliveryFee: '30',
    phone: '',
    email: '',
    facebook: '',
    instagram: '',
    twitter: '',
    isOpen: true,
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await restaurantsAPI.getAll();
        setRestaurants(res.data?.restaurants || []);
      } catch (error: any) {
        addToast(
          error.response?.data?.message || 'Failed to load restaurants',
          'error',
          3000
        );
      }
      setLoading(false);
    };
    fetchRestaurants();
  }, [addToast]);

  const filteredRestaurants = restaurants.filter((restaurant: any) =>
    restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await restaurantsAPI.delete(id);
      setRestaurants(restaurants.filter((r: any) => r._id !== id));
      addToast('Restaurant deleted successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to delete restaurant',
        'error',
        3000
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      addToast('Restaurant name is required', 'warning', 3000);
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
        deliveryRadius: parseFloat(formData.deliveryRadius) || 5,
        minOrderAmount: parseFloat(formData.minOrderAmount) || 100,
        deliveryFee: parseFloat(formData.deliveryFee) || 30,
        phone: formData.phone,
        email: formData.email,
        facebook: formData.facebook,
        instagram: formData.instagram,
        twitter: formData.twitter,
        isOpen: formData.isOpen,
      };

      if (editingRestaurant) {
        await restaurantsAPI.update(editingRestaurant._id, submitData);
        setRestaurants(
          restaurants.map((r) =>
            r._id === editingRestaurant._id ? { ...r, ...submitData } : r
          )
        );
        addToast('Restaurant updated successfully!', 'success', 3000);
      } else {
        const res = await restaurantsAPI.create(submitData);
        setRestaurants([...restaurants, res.data.restaurant]);
        addToast('Restaurant created successfully!', 'success', 3000);
      }

      setShowForm(false);
      setEditingRestaurant(null);
      resetForm();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to save restaurant',
        'error',
        3000
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      latitude: '',
      longitude: '',
      deliveryRadius: '5',
      minOrderAmount: '100',
      deliveryFee: '30',
      phone: '',
      email: '',
      facebook: '',
      instagram: '',
      twitter: '',
      isOpen: true,
    });
  };

  const handleEdit = (restaurant: any) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description || '',
      image: restaurant.image || '',
      latitude: restaurant.location?.coordinates?.[1] || '',
      longitude: restaurant.location?.coordinates?.[0] || '',
      deliveryRadius: String(restaurant.deliveryRadius || 5),
      minOrderAmount: String(restaurant.minOrderAmount || 100),
      deliveryFee: String(restaurant.deliveryFee || 30),
      phone: restaurant.contact?.phone || '',
      email: restaurant.contact?.email || '',
      facebook: restaurant.socialLinks?.facebook || '',
      instagram: restaurant.socialLinks?.instagram || '',
      twitter: restaurant.socialLinks?.twitter || '',
      isOpen: restaurant.isOpen,
    });
    setShowForm(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await restaurantsAPI.updateStatus(id, !currentStatus);
      setRestaurants(
        restaurants.map((r) =>
          r._id === id ? { ...r, isOpen: !currentStatus } : r
        )
      );
      addToast(
        `Restaurant is now ${!currentStatus ? 'open' : 'closed'}`,
        'success',
        3000
      );
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to update status',
        'error',
        3000
      );
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">
              Restaurant <span className="text-primary-gold">Management</span>
            </h1>
            <button
              onClick={() => {
                setEditingRestaurant(null);
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-accent-gold text-dark-bg font-bold hover:shadow-glow transition-all"
            >
              + Add Restaurant
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">🏪</div>
            <div className="stat-card-value text-primary-gold">{restaurants.length}</div>
            <p className="stat-card-label">Total Restaurants</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{restaurants.filter((r: any) => r.isOpen).length}</div>
            <p className="stat-card-label">Open Now</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-red-500/10 text-red-400">✕</div>
            <div className="stat-card-value text-red-400">{restaurants.filter((r: any) => !r.isOpen).length}</div>
            <p className="stat-card-label">Closed</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10 mb-8">
          <label className="block text-sm font-semibold mb-2 text-white">
            Search Restaurant
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-gold/50 focus:outline-none transition-all"
          />
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Loading restaurants...
            </div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Delivery Fee
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants.map((restaurant: any) => (
                    <tr
                      key={restaurant._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {restaurant.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {restaurant.contact?.phone}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        <span className="text-primary-gold">
                          ₹{restaurant.deliveryFee}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            restaurant.isOpen
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {restaurant.isOpen ? '✓ Open' : '✕ Closed'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleStatus(restaurant._id, restaurant.isOpen)}
                            className="px-3 py-1.5 rounded text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-semibold transition-all"
                          >
                            {restaurant.isOpen ? 'Close' : 'Open'}
                          </button>
                          <button
                            onClick={() => handleEdit(restaurant)}
                            className="px-3 py-1.5 rounded text-sm bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30 font-semibold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant._id)}
                            className="px-3 py-1.5 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 font-semibold transition-all"
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
          {!loading && filteredRestaurants.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No restaurants found
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Rachabanda Ruchulu"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="e.g., Authentic Telugu Cuisine"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="info@restaurant.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      placeholder="e.g., 17.3850"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      placeholder="e.g., 78.4867"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.deliveryRadius}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryRadius: e.target.value,
                        })
                      }
                      placeholder="5"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Min Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      placeholder="100"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Delivery Fee (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.deliveryFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryFee: e.target.value,
                        })
                      }
                      placeholder="30"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={formData.facebook}
                      onChange={(e) =>
                        setFormData({ ...formData, facebook: e.target.value })
                      }
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) =>
                        setFormData({ ...formData, twitter: e.target.value })
                      }
                      placeholder="https://twitter.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isOpen}
                        onChange={(e) =>
                          setFormData({ ...formData, isOpen: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-white font-medium">
                        Restaurant is Open
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRestaurant(null);
                    resetForm();
                  }}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-accent-gold text-dark-bg font-bold hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingRestaurant
                      ? 'Update Restaurant'
                      : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
