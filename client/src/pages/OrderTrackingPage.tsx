import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderAPI } from '@/lib/api';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: '🛒', desc: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Restaurant confirmed your order' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is cooking your food' },
  { key: 'ready', label: 'Ready', icon: '📦', desc: 'Food is packed and ready' },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🚗', desc: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Enjoy your meal!' },
];

function getActiveStep(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx + 1 : 1;
}

function formatAddress(addr: any): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.addressLine1,
    addr.addressLine2,
    addr.city,
    addr.state,
    addr.zipCode,
  ].filter(Boolean);
  return parts.join(', ');
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(id!);
        setOrder(res.data?.order || res.data);
      } catch {
        setError('Order not found');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-12 bg-dark-card rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-dark-card rounded-xl"></div>
              <div className="h-40 bg-dark-card rounded-xl"></div>
            </div>
            <div className="h-96 bg-dark-card rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto card text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-2xl font-bold mb-4">{error || 'Order not found'}</h2>
          <Link to="/profile"><button className="btn btn-primary">Go to Profile</button></Link>
        </div>
      </main>
    );
  }

  const currentStatus = order.status || 'placed';
  const activeStep = getActiveStep(currentStatus);
  const isCancelled = currentStatus === 'cancelled';
  const isDelivered = currentStatus === 'delivered';
  const items = order.items || [];
  const subtotal = order.subtotal || 0;
  const tax = order.tax || 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const discount = order.discount || 0;
  const total = order.total || order.totalAmount || 0;
  const addressText = formatAddress(order.deliveryAddress);
  const paymentMethod = order.paymentMethod || 'cod';
  const paymentStatus = order.paymentStatus || 'pending';
  const deliveryType = order.deliveryType || 'delivery';
  const orderId = order.orderId || (order._id || id || '').slice(-10).toUpperCase();

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3">Track <span className="text-primary-gold">Order</span></h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>Order: <span className="text-white font-semibold">{orderId}</span></span>
            {order.createdAt && (
              <span>Placed on: <span className="text-white font-semibold">{formatDate(order.createdAt)}</span></span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isCancelled ? 'bg-red-500/20 text-red-400' :
              isDelivered ? 'bg-green-500/20 text-green-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isCancelled ? '✗ Cancelled' : isDelivered ? '✓ Delivered' : '● Live Tracking'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Timeline + Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Order Timeline */}
            <div className="card">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="text-primary-gold">🗺</span> Order Timeline
              </h3>
              <div className="space-y-0">
                {statusSteps.map((step, index) => {
                  const isDone = index + 1 < activeStep;
                  const isCurrent = index + 1 === activeStep && !isCancelled;
                  const isLast = index === statusSteps.length - 1;

                  return (
                    <div key={step.key} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 border-2 transition-all ${
                          isCurrent ? 'bg-primary-gold border-primary-gold text-dark-bg shadow-lg shadow-primary-gold/40 scale-110' :
                          isDone ? 'bg-primary-gold/20 border-primary-gold text-primary-gold' :
                          'bg-dark-input border-gray-600 text-gray-500'
                        }`}>
                          {step.icon}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 min-h-[32px] my-1 ${isDone || isCurrent ? 'bg-primary-gold/50' : 'bg-gray-700'}`}></div>
                        )}
                      </div>
                      <div className={`pb-8 pt-1.5 flex-1 ${isLast ? 'pb-0' : ''}`}>
                        <div className={`font-bold text-base ${isCurrent ? 'text-primary-gold' : isDone ? 'text-white' : 'text-gray-500'}`}>
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-primary-gold/20 text-primary-gold px-2 py-0.5 rounded-full font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-gold animate-pulse inline-block"></span>
                              Current Status
                            </span>
                          )}
                        </div>
                        <div className={`text-sm mt-0.5 ${isCurrent ? 'text-gray-300' : isDone ? 'text-gray-400' : 'text-gray-600'}`}>{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order & Delivery Details */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-primary-gold">📋</span> Order Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div className="bg-dark-input rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Delivery Type</p>
                  <p className="font-bold text-white capitalize">{deliveryType === 'takeaway' ? '🏪 Pickup' : '🚗 Delivery'}</p>
                </div>
                <div className="bg-dark-input rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Payment</p>
                  <p className="font-bold text-white capitalize">{paymentMethod === 'cod' ? '💵 Cash on Delivery' : paymentMethod === 'razorpay' ? '💳 Razorpay' : paymentMethod}</p>
                </div>
                <div className="bg-dark-input rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Payment Status</p>
                  <p className={`font-bold capitalize ${paymentStatus === 'completed' ? 'text-green-400' : paymentStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {paymentStatus === 'completed' ? '✓ Paid' : paymentStatus === 'failed' ? '✗ Failed' : '⏳ Pending'}
                  </p>
                </div>
                {order.createdAt && (
                  <div className="bg-dark-input rounded-xl p-4 col-span-2 sm:col-span-3">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Order Placed At</p>
                    <p className="font-bold text-white">{formatDate(order.createdAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            {(addressText || deliveryType === 'delivery') && (
              <div className="card">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <span className="text-primary-gold">📍</span> Delivery Address
                </h3>
                {addressText ? (
                  <div className="bg-dark-input rounded-xl p-4 flex items-start gap-3">
                    <span className="text-2xl mt-0.5">🏠</span>
                    <div>
                      {order.deliveryAddress?.label && (
                        <p className="text-xs uppercase tracking-wide text-primary-gold font-semibold mb-1 capitalize">{order.deliveryAddress.label}</p>
                      )}
                      <p className="text-white font-semibold">{addressText}</p>
                      {order.deliveryAddress?.phoneNumber && (
                        <p className="text-gray-400 text-sm mt-1">📞 {order.deliveryAddress.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Address will appear here once confirmed.</p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="card sticky top-28">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <span className="text-primary-gold">🧾</span> Order Summary
              </h3>

              <div className="space-y-3 mb-5">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.food?.image && (
                      <img
                        src={item.food.image}
                        alt={item.food.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.food?.name || item.name || 'Item'}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-white flex-shrink-0">₹{(item.price || 0) * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span><span>₹{tax}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span><span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span><span>- ₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-3 mt-1">
                  <span>Total</span>
                  <span className="text-primary-gold">₹{total}</span>
                </div>
              </div>

              <div className={`mt-5 px-4 py-3 rounded-xl text-center font-bold text-sm ${
                isCancelled ? 'bg-red-500/20 text-red-400' :
                isDelivered ? 'bg-green-500/20 text-green-400' :
                'bg-primary-gold/15 text-primary-gold'
              }`}>
                {isCancelled ? '✗ Order Cancelled' : isDelivered ? '🎉 Order Delivered!' : `🚀 ${statusSteps[activeStep - 1]?.label || 'Processing'}`}
              </div>

              <div className="mt-3 space-y-2">
                <Link to="/menu">
                  <button className="w-full btn btn-primary text-sm">Continue Shopping</button>
                </Link>
                <button className="w-full px-4 py-2 rounded-lg border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10 transition-all font-semibold text-sm">
                  Need Help? Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
