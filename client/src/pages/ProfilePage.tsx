import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '@/store/useStore';
import { userAPI, orderAPI } from '@/lib/api';

const LocationMapPicker = lazy(() => import('@/components/maps/LocationMapPicker'));

export default function ProfilePage() {
  const navigate = useNavigate();
  const storeUser = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const logout = useStore((s) => s.logout);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', phone: '', avatar: '👨' });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const emptyAddrForm = { label: 'home', addressLine1: '', addressLine2: '', city: '', state: '', zipCode: '', phoneNumber: '', latitude: undefined as number | undefined, longitude: undefined as number | undefined };
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ ...emptyAddrForm });
  const [addrSaving, setAddrSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, addressRes, ordersRes] = await Promise.allSettled([
          userAPI.getProfile(),
          userAPI.getAddresses(),
          orderAPI.getAll(),
        ]);
        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value.data?.user || profileRes.value.data;
          setUser({ name: p.name || '', email: p.email || '', phone: p.phone || '', avatar: '👨' });
        } else if (storeUser) {
          setUser({ name: storeUser.name, email: storeUser.email, phone: storeUser.phone || '', avatar: '👨' });
        }
        if (addressRes.status === 'fulfilled') {
          setAddresses(addressRes.value.data?.addresses || addressRes.value.data || []);
        }
        if (ordersRes.status === 'fulfilled') {
          setOrders(ordersRes.value.data?.orders || ordersRes.value.data || []);
        }
      } catch {
        if (storeUser) setUser({ name: storeUser.name, email: storeUser.email, phone: storeUser.phone || '', avatar: '👨' });
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({ name: user.name, email: user.email, phone: user.phone });
      setIsEditing(false);
    } catch {}
    setSaving(false);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await userAPI.deleteAddress(id);
      setAddresses(addresses.filter((a: any) => (a._id || a.id) !== id));
    } catch {}
  };

  const openAddForm = () => {
    setEditingAddressId(null);
    setAddrForm({ ...emptyAddrForm });
    setShowAddrForm(true);
  };

  const openEditForm = (addr: any) => {
    setEditingAddressId(addr._id || addr.id);
    setAddrForm({
      label: addr.label || 'home',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      phoneNumber: addr.phoneNumber || '',
      latitude: addr.location?.coordinates?.[1] ?? undefined,
      longitude: addr.location?.coordinates?.[0] ?? undefined,
    });
    setShowAddrForm(true);
  };

  const handleSaveAddress = async () => {
    if (!addrForm.addressLine1.trim() || !addrForm.city.trim() || !addrForm.zipCode.trim()) return;
    setAddrSaving(true);
    try {
      const payload: any = {
        label: addrForm.label,
        addressLine1: addrForm.addressLine1,
        addressLine2: addrForm.addressLine2,
        city: addrForm.city,
        state: addrForm.state,
        zipCode: addrForm.zipCode,
        phoneNumber: addrForm.phoneNumber,
      };
      if (addrForm.latitude != null && addrForm.longitude != null) {
        payload.location = { type: 'Point', coordinates: [addrForm.longitude, addrForm.latitude] };
      }
      if (editingAddressId) {
        await userAPI.updateAddress(editingAddressId, payload);
      } else {
        await userAPI.addAddress(payload);
      }
      const res = await userAPI.getAddresses();
      setAddresses(res.data?.addresses || res.data || []);
      setShowAddrForm(false);
    } catch {}
    setAddrSaving(false);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await userAPI.updateAddress(id, { isDefault: true });
      const res = await userAPI.getAddresses();
      setAddresses(res.data?.addresses || res.data || []);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-dark-card rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-64 bg-dark-card rounded-xl"></div>
              <div className="lg:col-span-3 h-96 bg-dark-card rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">My <span className="text-primary-gold">Profile</span></h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-28">
                <div className="text-center mb-6 pb-6 border-b border-gray-600">
                  <div className="text-6xl mb-3">{user.avatar}</div>
                  <h3 className="text-xl font-bold">{user.name || 'User'}</h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab('profile')} className={`block w-full text-left px-4 py-3 rounded-lg transition-all font-semibold ${activeTab === 'profile' ? 'bg-primary-gold text-secondary-dark-brown' : 'text-gray-300 hover:text-primary-gold'}`}>👤 Profile</button>
                  <button onClick={() => setActiveTab('addresses')} className={`block w-full text-left px-4 py-3 rounded-lg transition-all font-semibold ${activeTab === 'addresses' ? 'bg-primary-gold text-secondary-dark-brown' : 'text-gray-300 hover:text-primary-gold'}`}>📍 Addresses</button>
                  <button onClick={() => setActiveTab('orders')} className={`block w-full text-left px-4 py-3 rounded-lg transition-all font-semibold ${activeTab === 'orders' ? 'bg-primary-gold text-secondary-dark-brown' : 'text-gray-300 hover:text-primary-gold'}`}>📦 Orders</button>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-lg text-red-400 hover:text-red-300 font-semibold">🚪 Logout</button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="card">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Profile Information</h3>
                    <button onClick={() => setIsEditing(!isEditing)} className="text-primary-gold hover:text-primary-accent-gold font-semibold">{isEditing ? 'Cancel' : 'Edit'}</button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name</label>
                      <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} disabled={!isEditing} className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} disabled={!isEditing} className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone Number</label>
                      <input type="tel" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} disabled={!isEditing} className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold disabled:opacity-50" />
                    </div>
                    {isEditing && (
                      <button onClick={handleSaveProfile} disabled={saving} className="w-full btn btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">My Addresses</h3>
                    {!showAddrForm && (
                      <button onClick={openAddForm} className="btn btn-primary px-5 py-2 text-sm">+ Add Address</button>
                    )}
                  </div>

                  {showAddrForm && (
                    <div className="card space-y-4">
                      <h4 className="text-lg font-bold text-primary-gold">{editingAddressId ? 'Edit Address' : 'New Address'}</h4>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Address Type</label>
                        <div className="flex gap-3">
                          {['home', 'work', 'other'].map((lbl) => (
                            <button key={lbl} type="button" onClick={() => setAddrForm({ ...addrForm, label: lbl })}
                              className={`px-4 py-2 rounded-lg border transition-all capitalize text-sm font-semibold ${addrForm.label === lbl ? 'border-primary-gold bg-primary-gold/20 text-primary-gold' : 'border-gray-600 text-gray-400 hover:border-primary-gold/50'}`}>
                              {lbl === 'home' ? '🏠' : lbl === 'work' ? '💼' : '📌'} {lbl}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Address Line 1 *</label>
                        <input type="text" value={addrForm.addressLine1} onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })} placeholder="House/Flat no., Building, Street" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Address Line 2</label>
                        <input type="text" value={addrForm.addressLine2} onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })} placeholder="Area, Landmark (optional)" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">City *</label>
                          <input type="text" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="Hyderabad" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">State *</label>
                          <input type="text" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} placeholder="Telangana" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">PIN Code *</label>
                          <input type="text" value={addrForm.zipCode} onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })} placeholder="500001" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Phone</label>
                          <input type="tel" value={addrForm.phoneNumber} onChange={(e) => setAddrForm({ ...addrForm, phoneNumber: e.target.value })} placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-3">
                          📍 Pin Location on Map <span className="text-gray-500 font-normal">(click map or drag pin)</span>
                        </label>
                        <Suspense fallback={<div className="h-64 bg-dark-input rounded-lg animate-pulse" />}>
                          <LocationMapPicker
                            latitude={addrForm.latitude}
                            longitude={addrForm.longitude}
                            onChange={(lat: number, lng: number) => setAddrForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
                          />
                        </Suspense>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={handleSaveAddress} disabled={addrSaving || !addrForm.addressLine1.trim() || !addrForm.city.trim() || !addrForm.zipCode.trim()} className="btn btn-primary disabled:opacity-50">
                          {addrSaving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button onClick={() => setShowAddrForm(false)} className="btn btn-outline">Cancel</button>
                      </div>
                    </div>
                  )}

                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((addr: any) => {
                        const addrId = addr._id || addr.id;
                        return (
                          <div key={addrId} className="card">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{addr.label === 'home' ? '🏠' : addr.label === 'work' ? '💼' : '📌'}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold capitalize">{addr.label || 'Address'}</h4>
                                    {addr.isDefault && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-gold/20 text-primary-gold">Default</span>}
                                  </div>
                                  <p className="text-gray-400 text-sm">
                                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                                    {addr.city}, {addr.state} - {addr.zipCode}
                                  </p>
                                  {addr.phoneNumber && <p className="text-gray-500 text-xs mt-1">{addr.phoneNumber}</p>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                              <button onClick={() => openEditForm(addr)} className="px-4 py-2 rounded-lg border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10 font-semibold text-sm transition">Edit</button>
                              {!addr.isDefault && (
                                <button onClick={() => handleSetDefault(addrId)} className="px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:border-primary-gold/30 hover:text-primary-gold font-semibold text-sm transition">Set as Default</button>
                              )}
                              <button onClick={() => handleDeleteAddress(addrId)} className="px-4 py-2 rounded-lg border border-red-600/30 text-red-400 hover:bg-red-600/10 font-semibold text-sm transition">Delete</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : !showAddrForm ? (
                    <div className="card text-center py-12">
                      <p className="text-4xl mb-3">📍</p>
                      <p className="text-gray-400 mb-4">No saved addresses yet</p>
                      <button onClick={openAddForm} className="btn btn-primary">Add Your First Address</button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Order History</h3>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order._id || order.id} className="card">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold">Order #{(order._id || order.id || '').slice(-6)}</h4>
                              <p className="text-gray-400 text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date || ''}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {order.status === 'delivered' ? '✓ Delivered' : order.status || 'Processing'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-4">
                            {order.items?.map((i: any) => `${i.food?.name || i.name || 'Item'} x${i.quantity}`).join(', ') || ''}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-primary-gold">₹{order.total || order.totalAmount || 0}</span>
                            <Link to={`/order/${order._id || order.id}`}>
                              <button className="px-4 py-2 rounded-lg border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10 font-semibold">Track Order</button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card text-center py-12">
                      <p className="text-gray-400">No orders yet</p>
                      <Link to="/menu"><button className="btn btn-primary mt-4">Start Ordering</button></Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}
