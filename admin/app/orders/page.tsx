'use client';

import { useState, useEffect } from 'react';
import { ordersAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import AdminSelect from '@/components/AdminSelect';

export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getAll();
        setOrders(res.data?.orders || res.data || []);
      } catch (error) {
        addToast('Failed to load orders', 'error', 3000);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [addToast]);

  const filteredOrders = orders.filter(
    (order: any) => filterStatus === 'All' || order.ordersStatus === filterStatus
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      setOrders(orders.map((o: any) => ((o._id || o.id) === id ? { ...o, ordersStatus: newStatus } : o)));
      addToast('Order status updated successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update order status', 'error', 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'out-for-delivery': return 'bg-blue-500/20 text-blue-400';
      case 'preparing': return 'bg-yellow-500/20 text-yellow-400';
      case 'ready': return 'bg-purple-500/20 text-purple-400';
      case 'placed': return 'bg-red-500/20 text-red-400';
      case 'confirmed': return 'bg-orange-500/20 text-orange-400';
      case 'cancelled': return 'bg-gray-600/20 text-gray-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getCustomerName = (order: any) => order.user?.name || order.customer || order.contactInfo?.name || 'Unknown';
  const getItemsSummary = (order: any) => order.items?.map((i: any) => `${i.food?.name || i.name || 'Item'} x${i.quantity}`).join(', ') || '';
  const getOrderDate = (order: any) => order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Order <span className="text-primary-gold">Management</span></h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">📦</div>
            <div className="stat-card-value text-primary-gold">{orders.length}</div>
            <p className="stat-card-label">Total Orders</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-yellow-500/10 text-yellow-400">⏳</div>
            <div className="stat-card-value text-yellow-400">{orders.filter((o: any) => o.ordersStatus === 'placed' || o.ordersStatus === 'confirmed').length}</div>
            <p className="stat-card-label">Pending</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-blue-500/10 text-blue-400">🚚</div>
            <div className="stat-card-value text-blue-400">{orders.filter((o: any) => o.ordersStatus === 'out-for-delivery').length}</div>
            <p className="stat-card-label">In Transit</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{orders.filter((o: any) => o.ordersStatus === 'delivered').length}</div>
            <p className="stat-card-label">Delivered</p>
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Filter by Status</label>
              <AdminSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'All', label: 'All' },
                  { value: 'placed', label: 'Placed' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'preparing', label: 'Preparing' },
                  { value: 'ready', label: 'Ready' },
                  { value: 'out-for-delivery', label: 'Out for Delivery' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading orders...</div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left font-semibold">Items</th>
                    <th className="px-6 py-4 text-left font-semibold">Total</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => (
                    <tr key={order._id || order.id} className="border-b border-gray-600 hover:bg-dark-input/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary-gold">#{(order._id || order.id)?.slice(-6)}</td>
                      <td className="px-6 py-4">{getCustomerName(order)}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-[200px] truncate">{getItemsSummary(order)}</td>
                      <td className="px-6 py-4 font-bold">₹{order.totalAmount || order.total || 0}</td>
                      <td className="px-4 py-4">
                        <AdminSelect
                          value={order.ordersStatus}
                          onChange={(v) => handleStatusChange(order._id || order.id, v)}
                          options={[
                            { value: 'placed', label: 'Placed' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'preparing', label: 'Preparing' },
                            { value: 'ready', label: 'Ready' },
                            { value: 'out-for-delivery', label: 'Out for Delivery' },
                            { value: 'delivered', label: 'Delivered' },
                            { value: 'cancelled', label: 'Cancelled' },
                          ]}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{getOrderDate(order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredOrders.length === 0 && <div className="text-center py-12 text-gray-400">No orders found</div>}
        </div>
      </div>
    </main>
  );
}
