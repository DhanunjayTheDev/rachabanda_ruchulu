'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { userAPI, orderAPI } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
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

  useEffect(() => {
    if (!token) {
      router.push('/login');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    router.push('/');
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
                  <h3 className="text-2xl font-bold">My Addresses</h3>
                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((addr: any) => (
                        <div key={addr._id || addr.id} className="card">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold">{addr.label || 'Address'}</h4>
                              <p className="text-gray-400">{addr.address || addr.street || ''}</p>
                            </div>
                            {addr.isDefault && <span className="px-3 py-1 rounded-full bg-primary-gold/20 text-primary-gold text-sm font-semibold">Default</span>}
                          </div>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10 font-semibold">Edit</button>
                            <button onClick={() => handleDeleteAddress(addr._id || addr.id)} className="px-4 py-2 rounded-lg border border-red-600/30 text-red-400 hover:bg-red-600/10 font-semibold">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card text-center py-12"><p className="text-gray-400">No saved addresses</p></div>
                  )}
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
                            <Link href={`/order/${order._id || order.id}`}>
                              <button className="px-4 py-2 rounded-lg border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10 font-semibold">Track Order</button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card text-center py-12">
                      <p className="text-gray-400">No orders yet</p>
                      <Link href="/menu"><button className="btn btn-primary mt-4">Start Ordering</button></Link>
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
