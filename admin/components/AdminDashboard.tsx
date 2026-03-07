'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI, ordersAPI, adminAuthAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

const COLORS = ['#D4AF37', '#E7C873', '#5A3E2B', '#2B1D15', '#8B6F47'];

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [adminName, setAdminName] = useState('Admin');
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admin profile
        try {
          const profileRes = await adminAuthAPI.getProfile();
          if (profileRes.data?.admin?.name) {
            setAdminName(profileRes.data.admin.name);
          }
        } catch {}

        // Fetch dashboard stats
        const [statsRes, ordersRes, revenueRes] = await Promise.allSettled([
          dashboardAPI.getStats(),
          ordersAPI.getAll(),
          dashboardAPI.getRevenue('weekly'),
        ]);

        if (statsRes.status === 'fulfilled') {
          const s = statsRes.value.data;
          setStats(s);
          if (s.categoryData) setCategoryData(s.categoryData);
        } else {
          addToast('Failed to load dashboard stats', 'error', 3000);
        }

        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value.data?.orders || ordersRes.value.data || [];
          setRecentOrders(orders.slice(0, 5));
        }

        if (revenueRes.status === 'fulfilled') {
          setSalesData(revenueRes.value.data?.salesData || revenueRes.value.data || []);
        }
      } catch (error) {
        addToast('Error loading dashboard data', 'error', 3000);
      }
      setLoading(false);
    };
    fetchData();
  }, [addToast]);

  const revenue = stats?.dailyRevenue || stats?.revenue || 0;
  const ordersToday = stats?.ordersToday || stats?.totalOrders || 0;
  const totalCustomers = stats?.totalCustomers || 0;
  const avgRating = stats?.avgRating || 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {adminName}! 👋</p>
      </div>

      {/* Stats Grid at Top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="stat-card">
          <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">💰</div>
          <div className="stat-card-value text-primary-gold">
            {loading ? '...' : `₹${(revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </div>
          <p className="stat-card-label">Daily Revenue</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon bg-blue-500/10 text-blue-400">📦</div>
          <div className="stat-card-value text-blue-400">{loading ? '...' : ordersToday}</div>
          <p className="stat-card-label">Orders Today</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon bg-purple-500/10 text-purple-400">👥</div>
          <div className="stat-card-value text-purple-400">
            {loading ? '...' : totalCustomers.toLocaleString()}
          </div>
          <p className="stat-card-label">Total Customers</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon bg-yellow-500/10 text-yellow-400">⭐</div>
          <div className="stat-card-value text-yellow-400">{loading ? '...' : avgRating ? avgRating.toFixed(1) : '—'}</div>
          <p className="stat-card-label">Avg Rating</p>
        </div>
      </div>

      {/* Charts */}
      {salesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1410', border: '1px solid #D4AF37', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37' }} />
                <Line type="monotone" dataKey="orders" stroke="#E7C873" strokeWidth={2} dot={{ fill: '#E7C873' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {categoryData.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Top Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#D4AF37" dataKey="value">
                    {categoryData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1A1410', border: '1px solid #D4AF37' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-gold/20">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Order ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Customer</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <tr key={order._id || order.id} className="border-b border-primary-gold/10 hover:bg-primary-gold/5 transition-colors">
                    <td className="py-3 px-4 text-white">#{(order._id || order.id || '').slice(-6)}</td>
                    <td className="py-3 px-4 text-gray-400">{order.contact?.name || order.customer?.name || order.user?.name || 'Guest'}</td>
                    <td className="py-3 px-4 text-primary-gold font-semibold">₹{order.total || order.totalAmount || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No recent orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
