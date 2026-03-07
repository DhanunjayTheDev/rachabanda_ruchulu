'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { orderAPI, userAPI, settingsAPI } from '@/lib/api';
import AddressFields from '@/components/forms/AddressFields';
import LoginDialog from '@/components/modals/LoginDialog';
import { useToast } from '@/lib/ToastContext';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useStore((s) => s.items);
  const getTotalPrice = useStore((s) => s.getTotalPrice);
  const clearCart = useStore((s) => s.clearCart);
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const isLoggedInStatus = useStore((s) => s.isLoggedIn());
  const { addToast } = useToast();

  const [deliveryType, setDeliveryType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    settingsAPI.get()
      .then((res) => setSettings(res.data?.settings))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setContact({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
    }
    if (token) {
      userAPI.getAddresses().then((res) => {
        const addrs = res.data?.addresses || res.data || [];
        setAddresses(addrs);
        if (addrs.length > 0) setSelectedAddress(addrs[0]._id || addrs[0].id || '0');
      }).catch(() => {});
    }
  }, [user, token]);

  const subtotal = getTotalPrice();
  const deliveryFee = deliveryType === 'delivery' ? (settings?.deliveryCharge ?? 30) : 0;
  const tax = Math.floor(subtotal * ((settings?.taxRate ?? 5) / 100));
  const total = subtotal + tax + deliveryFee;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    // Validate address
    if (deliveryType === 'delivery') {
      const isUsingNewAddress = newAddress.street || newAddress.city || newAddress.state || newAddress.pincode;
      const isUsingExisting = selectedAddress && addresses.length > 0;

      if (!isUsingNewAddress && !isUsingExisting) {
        setError('Please select or enter a delivery address');
        return;
      }

      if (isUsingNewAddress && (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode)) {
        setError('Please fill all address fields');
        return;
      }
    }

    setPlacing(true);
    setError('');
    try {
      const addressToUse = newAddress.street
        ? `${newAddress.street}, ${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}${
            newAddress.latitude ? ` (Lat: ${newAddress.latitude}, Lon: ${newAddress.longitude})` : ''
          }`
        : addresses.find((a: any) => (a._id || a.id) === selectedAddress)?.address || '';

      const orderData = {
        items: items.map((i) => ({ food: i.foodId, quantity: i.quantity, price: i.price })),
        deliveryType,
        paymentMethod,
        deliveryAddress: addressToUse,
        contact,
        total,
      };
      const res = await orderAPI.create(orderData);
      const orderId = res.data?.order?._id || res.data?._id || 'new';
      addToast('Order placed successfully!', 'success');
      clearCart();
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto card text-center py-20">
          <p className="text-4xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link href="/menu"><button className="btn btn-primary">Browse Menu</button></Link>
        </div>
      </main>
    );
  }

  if (!isLoggedInStatus) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto card text-center py-20">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-2xl font-bold mb-4">Please log in to continue</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to place an order</p>
          <button onClick={() => setShowLoginDialog(true)} className="btn btn-primary">Login / Sign Up</button>
          <Link href="/cart"><button className="btn btn-outline mt-3">Back to Cart</button></Link>
        </div>
        <LoginDialog
          open={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLoginSuccess={() => {
            addToast('Login successful! Ready to checkout', 'success');
            setTimeout(() => router.refresh(), 500);
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4"><span className="text-primary-gold">Checkout</span></h1>
        </div>

        {error && <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Type */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-6">Delivery Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDeliveryType('delivery')} className={`p-6 rounded-lg border-2 transition-all ${deliveryType === 'delivery' ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold'}`}>
                  <div className="text-3xl mb-2">🚗</div><div className="font-bold">Delivery</div><div className="text-sm text-gray-400">30-45 mins</div>
                </button>
                <button onClick={() => setDeliveryType('pickup')} className={`p-6 rounded-lg border-2 transition-all ${deliveryType === 'pickup' ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold'}`}>
                  <div className="text-3xl mb-2">🏪</div><div className="font-bold">Pickup</div><div className="text-sm text-gray-400">15-20 mins</div>
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            {deliveryType === 'delivery' && (
              <div className="card">
                <h3 className="text-2xl font-bold mb-6">Delivery Address</h3>
                {addresses.length > 0 && (
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-600">
                    <label className="block text-sm font-semibold mb-3">Saved Addresses</label>
                    {addresses.map((addr: any) => {
                      const addrId = addr._id || addr.id;
                      return (
                        <label key={addrId} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAddress === addrId ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold'}`}>
                          <input type="radio" name="address" checked={selectedAddress === addrId} onChange={() => setSelectedAddress(addrId)} className="w-5 h-5 accent-primary-gold" />
                          <div className="flex-1">
                            <div className="font-bold">{addr.label || 'Address'}</div>
                            <div className="text-sm text-gray-400">{addr.address || addr.street || ''}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold mb-4 text-primary-gold">{addresses.length > 0 ? 'Or enter new address' : 'Enter delivery address'}</label>
                  <AddressFields address={newAddress} onChange={setNewAddress} includeGeolocation={true} />
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input type="text" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+91 9876543210" className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-6">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-5 h-5 accent-primary-gold" />
                  <div className="flex-1"><div className="font-bold">Online Payment</div><div className="text-sm text-gray-400">Card, UPI, Wallet</div></div>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-primary-gold" />
                  <div className="flex-1"><div className="font-bold">Cash on Delivery</div><div className="text-sm text-gray-400">Pay when you receive</div></div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="card sticky top-28 h-fit">
            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-600">
              {items.map((item) => (
                <div key={item.foodId} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-6 pb-6 border-b border-gray-600">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="font-semibold">₹{subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Tax (5%)</span><span className="font-semibold">₹{tax}</span></div>
              {deliveryType === 'delivery' && <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery Fee</span><span className="font-semibold">₹{deliveryFee}</span></div>}
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Total</span>
              <span className="text-3xl font-bold text-primary-gold">₹{total}</span>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing} className="w-full btn btn-primary mb-3 disabled:opacity-50">
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
            <Link href="/cart"><button className="w-full btn btn-outline">Back to Cart</button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
