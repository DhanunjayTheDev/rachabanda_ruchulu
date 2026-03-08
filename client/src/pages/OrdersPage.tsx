import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import useStore from '@/store/useStore';

interface OrderItem {
  food?: { name: string; price: number };
  name?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  selectedSize?: string;
  specialInstructions?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount?: number;
  total?: number;
  status: string;
  createdAt: string;
  deliveryType?: string;
  paymentStatus?: string;
}

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-500/20 text-green-400',
  'out-for-delivery': 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-yellow-500/20 text-yellow-400',
  ready: 'bg-purple-500/20 text-purple-400',
  placed: 'bg-red-500/20 text-red-400',
  confirmed: 'bg-orange-500/20 text-orange-400',
  cancelled: 'bg-gray-600/20 text-gray-400',
};

export default function OrdersPage() {
  const { addToast } = useToast();
  const { isLoggedIn } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      addToast('Please login to view your orders', 'warning');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getAll();
        setOrders(res.data?.orders || res.data || []);
      } catch (error) {
        addToast('Failed to load orders', 'error', 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, addToast]);

  if (!isLoggedIn()) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="card text-center py-12 max-w-md">
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-400 mb-6">Please login to view your orders</p>
          <Link to="/login">
            <button className="btn btn-primary w-full">Go to Login</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">My <span className="text-primary-gold">Orders</span></h1>
          <p className="text-gray-400 mt-2">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="card py-12 text-center text-gray-400">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">📭</p>
            <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
            <p className="text-gray-400 mb-6">You haven't placed any orders. Start exploring our menu!</p>
            <Link to="/menu">
              <button className="btn btn-primary">Browse Menu</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">ORDER ID</p>
                    <p className="font-bold text-primary-gold">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">ITEMS</p>
                    <p className="text-sm">
                      {order.items.map((i) => `${i.food?.name || i.name || 'Item'} ×${i.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">TOTAL</p>
                    <p className="font-bold">₹{(order.totalAmount || order.total || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">STATUS</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.placed}`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">DATE</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
