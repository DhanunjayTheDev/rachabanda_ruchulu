import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import useStore from '@/store/useStore';
import { X, Navigation, CreditCard, Loader2 } from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtime';

interface OrderItem {
  food?: {
    name: string;
    price: number;
    sizes?: { _id: string; name: string }[];
    addOns?: { _id: string; name: string }[];
  };
  name?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  selectedSize?: string;
  selectedAddOns?: string[];
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
  deliveryAddress?: any;
  deliveryAddressStr?: string;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  couponDiscount?: number;
}

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-500/20 text-green-400',
  'out-for-delivery': 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-yellow-500/20 text-yellow-400',
  ready: 'bg-purple-500/20 text-purple-400',
  placed: 'bg-red-500/20 text-red-400',
  confirmed: 'bg-orange-500/20 text-orange-400',
  cancelled: 'bg-gray-600/20 text-gray-400',
  pending_payment: 'bg-white/5 text-gray-500 border border-white/10',
};

export default function OrdersPage() {
  const { addToast } = useToast();
  const { isLoggedIn } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [repaying, setRepaying] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data?.orders || res.data || []);
    } catch (error) {
      addToast('Failed to load orders', 'error', 3000);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!isLoggedIn()) {
      addToast('Please login to view your orders', 'warning');
      return;
    }
    fetchOrders();
  }, [isLoggedIn, addToast, fetchOrders]);

  useRealtimeOrders((action, updatedOrder) => {
    if (action === 'updated' || action === 'statusUpdate') {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o)));
      if (selectedOrder && selectedOrder._id === updatedOrder._id) {
        setSelectedOrder((prev) => prev ? { ...prev, ...updatedOrder } : prev);
      }
    } else if (action === 'created') {
      fetchOrders();
    }
  });

  const handleRepay = async (order: Order) => {
    try {
      setRepaying(order._id);

      const paymentRes = await paymentAPI.createOrder({
        orderId: order._id,
        amount: Number(order.totalAmount || order.total || 0)
      });

      if (!paymentRes.data?.success || !paymentRes.data?.razorpayOrderId) {
        throw new Error('Failed to create payment session');
      }

      const { razorpayOrderId, paymentId } = paymentRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
        amount: Math.round(Number(order.totalAmount || order.total || 0) * 100),
        currency: 'INR',
        name: 'Rachabanda Ruchulu',
        description: 'Order Payment Retry',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentAPI.verify({
              paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              addToast('Payment successful! 🎉', 'success');
              setSelectedOrder(null);
              fetchOrders();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            addToast(error.response?.data?.message || 'Verification failed', 'error');
          }
        },
        theme: { color: '#D4AF37' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      addToast(err.message || 'Payment failed to initiate', 'error');
    } finally {
      setRepaying(null);
    }
  };

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
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="card cursor-pointer hover:border-primary-gold/50 transition-all group"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-1">
                    <p className="text-xs text-gray-400 mb-1">ORDER ID</p>
                    <p className="font-bold text-primary-gold">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 mb-1">ITEMS</p>
                    <p className="text-sm line-clamp-2">
                      {order.items.map((i) => `${i.food?.name || i.name || 'Item'} ×${i.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-gray-400 mb-1">TOTAL</p>
                    <p className="font-bold">₹{(order.totalAmount || order.total || 0).toFixed(2)}</p>
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-gray-400 mb-1">STATUS</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.placed}`}>
                      {order.status === 'pending_payment' ? 'Waiting for Payment' : order.status.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <div className="md:col-span-1 flex justify-between items-center md:flex-col md:items-end md:justify-center">
                    <div>
                      <p className="text-xs text-gray-400 mb-1 md:hidden">DATE</p>
                      <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button className="text-primary-gold text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity hidden md:block mt-2">
                      View Details &rarr;
                    </button>
                    <button className="text-primary-gold text-sm font-semibold md:hidden">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#1a1c1e] rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden" onClick={(e) => e.stopPropagation()}>

            {/* STICKY HEADER */}
            <div className="p-6 pb-4 border-b border-gray-700 bg-[#1a1c1e] shrink-0 sticky top-0 z-10 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">Order Details</h2>
                <p className="text-primary-gold font-mono">#{selectedOrder._id.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white bg-dark-bg/50 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="p-6 overflow-y-auto grow">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-dark-bg/50 border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-bg/50 border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[selectedOrder.status] || STATUS_COLORS.placed}`}>
                    {selectedOrder.status === 'pending_payment' ? 'Waiting for Payment' : selectedOrder.status.replace(/-/g, ' ')}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-dark-bg/50 border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Delivery Type</p>
                  <p className="font-semibold capitalize">{selectedOrder.deliveryType || 'delivery'}</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-bg/50 border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Payment Status</p>
                  <p className="font-semibold capitalize">{selectedOrder.paymentStatus || 'pending'}</p>
                </div>
              </div>

              {selectedOrder.deliveryAddress && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2">Delivery Address</p>
                  <div className="p-4 rounded-lg bg-dark-bg/50 border border-gray-700/50">
                    <p className="text-sm text-gray-300">
                      {selectedOrder.deliveryAddressStr || (typeof selectedOrder.deliveryAddress === 'string'
                        ? selectedOrder.deliveryAddress
                        : (
                          <>
                            {selectedOrder.deliveryAddress.addressLine1}
                            {selectedOrder.deliveryAddress.addressLine2 ? `, ${selectedOrder.deliveryAddress.addressLine2}` : ''},
                            {' '}{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode}
                            {selectedOrder.deliveryAddress.phoneNumber && (
                              <span className="block mt-1">📞 {selectedOrder.deliveryAddress.phoneNumber}</span>
                            )}
                          </>
                        ))}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-2">
                <p className="text-sm font-semibold mb-2">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => {
                    const sizeName = item.selectedSize ? (item.food?.sizes?.find(s => s._id === item.selectedSize)?.name || item.selectedSize) : null;
                    const addOnNames = item.selectedAddOns?.map(addonId => item.food?.addOns?.find(a => a._id === addonId)?.name || addonId).filter(Boolean);

                    return (
                      <div key={idx} className="flex justify-between items-start p-3 rounded-lg bg-dark-bg/30 border border-gray-700/30 text-sm">
                        <div className="flex-1 pr-4">
                          <p className="font-semibold text-base mb-1">{item.food?.name || item.name || 'Item'} <span className="text-gray-400 font-normal">×{item.quantity}</span></p>
                          {sizeName && <p className="text-xs text-gray-400"><span className="text-gray-500">Size:</span> {sizeName}</p>}
                          {addOnNames && addOnNames.length > 0 && <p className="text-xs text-gray-400 mt-0.5"><span className="text-gray-500">Add-ons:</span> {addOnNames.join(', ')}</p>}
                        </div>
                        <p className="font-bold whitespace-nowrap pt-1 text-primary-gold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REPAY BUTTON IF PENDING */}
              {selectedOrder.status === 'pending_payment' && (
                <div className="mt-8 p-4 bg-primary-gold/5 border border-primary-gold/20 rounded-xl text-center">
                  <p className="text-sm text-gray-300 mb-4">You have not completed the payment for this order yet.</p>
                  <button
                    onClick={() => handleRepay(selectedOrder)}
                    disabled={repaying === selectedOrder._id}
                    className="btn btn-primary w-full py-4 flex items-center justify-center gap-2"
                  >
                    {repaying === selectedOrder._id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Initializing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay Now (₹{Number(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)})
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-2 italic">Note: Payment window expires in 5 minutes.</p>
                </div>
              )}
            </div>

            {/* STICKY FOOTER */}
            <div className="p-6 pt-4 border-t border-gray-700 bg-[#1a1c1e] shrink-0 sticky bottom-0 z-10 w-full">
              <div className="space-y-2 mb-4">
                {selectedOrder.subtotal !== undefined && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span><span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.tax !== undefined && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Tax</span><span>₹{selectedOrder.tax.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.deliveryFee !== undefined && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Delivery Fee</span><span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 mt-1 border-t border-gray-700/50">
                  <span>Total Amount</span>
                  <span className="text-primary-gold text-2xl">₹{(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.status !== 'pending_payment' && (
                <Link to={`/order/${selectedOrder._id}`} className="block w-full">
                  <button className="btn w-full btn-primary flex items-center justify-center gap-2 py-3">
                    <Navigation size={18} /> Track Order Real-time
                  </button>
                </Link>
              )}

              {selectedOrder.status === 'pending_payment' && (
                <button
                  className="btn glass-btn w-full"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
