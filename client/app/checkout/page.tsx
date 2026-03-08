'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import useStore from '@/store/useStore';
import { orderAPI, userAPI, settingsAPI, couponAPI, paymentAPI } from '@/lib/api';
import LoginDialog from '@/components/modals/LoginDialog';
import { useToast } from '@/lib/ToastContext';
import { useRealtimeSettings } from '@/hooks/useRealtime';

const LocationMapPicker = dynamic(() => import('@/components/maps/LocationMapPicker'), { ssr: false });

export default function CheckoutPage() {
  const router = useRouter();
  const items = useStore((s) => s.items);
  const getTotalPrice = useStore((s) => s.getTotalPrice);
  const clearCart = useStore((s) => s.clearCart);
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const isLoggedInStatus = useStore((s) => s.isLoggedIn());
  const syncCartFromServer = useStore((s) => s.syncCartFromServer);
  const { addToast } = useToast();

  const [deliveryType, setDeliveryType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [newAddress, setNewAddress] = useState({
    label: 'home',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    resolvedAddress: '',
  });
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<any>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; discount: number; discountType: string; discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    settingsAPI.get().then((res) => setSettings(res.data?.settings)).catch(() => {});
  }, []);

  // Listen for settings updates from admin in real-time
  useRealtimeSettings((updatedSettings) => {
    setSettings(updatedSettings);
    addToast('Settings updated! Prices may have changed.', 'info', 2000);
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Sync cart from server if logged in
    if (isLoggedInStatus) {
      syncCartFromServer();
    }
  }, [isLoggedInStatus, syncCartFromServer]);

  useEffect(() => {
    if (user) {
      setContact({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
    }
    if (token) {
      userAPI.getAddresses().then((res) => {
        const addrs = res.data?.addresses || res.data || [];
        setAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddressId(addrs[0]._id || addrs[0].id || '');
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      }).catch(() => { setShowNewAddressForm(true); });
    }
  }, [user, token]);

  const subtotal = getTotalPrice();
  const deliveryFee = deliveryType === 'delivery' ? (settings?.deliveryCharge ?? 30) : 0;
  const tax = Math.floor(subtotal * ((settings?.taxRate ?? 5) / 100));
  const couponDiscount = appliedCoupon ? Math.round(appliedCoupon.discount) : 0;
  const total = subtotal + tax + deliveryFee - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await couponAPI.verify({ code: couponCode.trim(), orderValue: subtotal });
      const c = res.data.coupon;
      setAppliedCoupon({ code: c.code, discount: c.discount, discountType: c.discountType, discountValue: c.discountValue });
      addToast(`Coupon "${c.code}" applied! You save ₹${Math.round(c.discount)}`, 'success');
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    addToast('Coupon removed', 'info');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setError('');

    if (deliveryType === 'delivery') {
      if (!selectedAddressId && !showNewAddressForm) {
        setError('Please select a delivery address'); return;
      }
      if (showNewAddressForm && (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.zipCode)) {
        setError('Please fill all required address fields'); return;
      }
    }

    setPlacing(true);
    try {
      let deliveryAddressId = selectedAddressId;

      if (showNewAddressForm && deliveryType === 'delivery' && saveNewAddress) {
        const savedRes = await userAPI.addAddress({
          label: newAddress.label,
          addressLine1: newAddress.addressLine1,
          addressLine2: newAddress.addressLine2,
          city: newAddress.city,
          state: newAddress.state,
          zipCode: newAddress.zipCode,
          phoneNumber: newAddress.phoneNumber,
          location: { type: 'Point', coordinates: [newAddress.longitude ?? 0, newAddress.latitude ?? 0] },
          isDefault: addresses.length === 0,
        });
        deliveryAddressId = savedRes.data?.address?._id || '';
      }

      const selectedAddr = addresses.find((a: any) => (a._id || a.id) === selectedAddressId);
      const deliveryAddressStr = selectedAddr
        ? `${selectedAddr.addressLine1}${selectedAddr.addressLine2 ? ', ' + selectedAddr.addressLine2 : ''}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.zipCode}`
        : `${newAddress.addressLine1}${newAddress.addressLine2 ? ', ' + newAddress.addressLine2 : ''}, ${newAddress.city}, ${newAddress.state} - ${newAddress.zipCode}`;

      const orderData = {
        items: items.map((i) => ({ 
          food: i.foodId, 
          quantity: i.quantity, 
          price: i.price,
          selectedSize: i.selectedSize,
          selectedAddOns: i.selectedAddOns 
        })),
        deliveryType,
        paymentMethod,
        deliveryAddress: deliveryAddressStr,
        deliveryAddressId: deliveryAddressId || undefined,
        contact,
        subtotal,
        tax,
        deliveryFee,
        couponCode: appliedCoupon?.code,
        couponDiscount,
        total,
      };

      // If payment method is Razorpay, handle payment first
      if (paymentMethod === 'razorpay') {
        // Create order on server
        const res = await orderAPI.create(orderData);
        const orderId = res.data?.order?._id || res.data?._id;

        if (!orderId) {
          throw new Error('Failed to create order');
        }

        // Create payment order on server
        const paymentRes = await paymentAPI.createOrder({ orderId, amount: total });
        const paymentId = paymentRes.data?.paymentId;
        const razorpayOrderId = paymentRes.data?.razorpayOrderId;

        if (!paymentRes.data?.success || !razorpayOrderId) {
          throw new Error('Failed to create payment order');
        }

        // Open Razorpay checkout
        if (!(window as any).Razorpay) {
          throw new Error('Razorpay script not loaded');
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
          amount: total * 100, // Amount in paise
          currency: 'INR',
          name: 'Rachabanda Ruchulu',
          description: 'Order Payment',
          order_id: razorpayOrderId,
          prefill: {
            name: contact.name,
            email: contact.email,
            contact: contact.phone,
          },
          handler: async (response: any) => {
            try {
              // Verify payment on server
              const verifyRes = await paymentAPI.verify({
                paymentId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.data?.success) {
                addToast('Payment successful! Order placed 🎉', 'success');
                clearCart();
                router.push(`/order/${orderId}`);
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error: any) {
              const errorMsg = error.response?.data?.message || 'Payment verification failed. Please contact support.';
              setError(errorMsg);
              addToast(errorMsg, 'error');
            }
          },
          modal: {
            ondismiss: () => {
              setError('Payment cancelled. Please try again.');
              addToast('Payment cancelled', 'error');
            },
          },
          theme: {
            color: '#D4AF37',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD - directly create order
        const res = await orderAPI.create(orderData);
        const orderId = res.data?.order?._id || res.data?._id || 'new';
        addToast('Order placed successfully! 🎉', 'success');
        clearCart();
        router.push(`/order/${orderId}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
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
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Delivery Type */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-6">Delivery Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDeliveryType('delivery')} className={`p-6 rounded-lg border-2 transition-all ${deliveryType === 'delivery' ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold'}`}>
                  <div className="text-3xl mb-2">🚗</div><div className="font-bold">Delivery</div><div className="text-sm text-gray-400">30-45 mins</div>
                </button>
                <button onClick={() => setDeliveryType('takeaway')} className={`p-6 rounded-lg border-2 transition-all ${deliveryType === 'takeaway' ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold'}`}>
                  <div className="text-3xl mb-2">🏪</div><div className="font-bold">Pickup</div><div className="text-sm text-gray-400">15-20 mins</div>
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            {deliveryType === 'delivery' && (
              <div className="card">
                <h3 className="text-2xl font-bold mb-6">Delivery Address</h3>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-semibold text-gray-300">Saved Addresses</p>
                    {addresses.map((addr: any) => {
                      const addrId = addr._id || addr.id;
                      return (
                        <label
                          key={addrId}
                          onClick={() => { setSelectedAddressId(addrId); setShowNewAddressForm(false); }}
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${!showNewAddressForm && selectedAddressId === addrId ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold/50'}`}
                        >
                          <input type="radio" name="address" readOnly checked={!showNewAddressForm && selectedAddressId === addrId} className="w-5 h-5 accent-primary-gold mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold capitalize">{addr.label || 'Address'}</span>
                              {addr.isDefault && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-gold/20 text-primary-gold">Default</span>}
                            </div>
                            <div className="text-sm text-gray-400">
                              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.zipCode}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                    <label
                      onClick={() => setShowNewAddressForm(true)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${showNewAddressForm ? 'border-primary-gold bg-primary-gold/10' : 'border-gray-600 hover:border-primary-gold/50'}`}
                    >
                      <input type="radio" name="address" readOnly checked={showNewAddressForm} className="w-5 h-5 accent-primary-gold" />
                      <span className="font-semibold text-primary-gold">+ Add New Address</span>
                    </label>
                  </div>
                )}

                {/* New Address Form */}
                {(showNewAddressForm || addresses.length === 0) && (
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-primary-gold">{addresses.length > 0 ? 'New Address' : 'Enter Delivery Address'}</h4>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Address Type</label>
                      <div className="flex gap-3">
                        {['home', 'work', 'other'].map((lbl) => (
                          <button key={lbl} type="button" onClick={() => setNewAddress({ ...newAddress, label: lbl })}
                            className={`px-4 py-2 rounded-lg border transition-all capitalize text-sm font-semibold ${newAddress.label === lbl ? 'border-primary-gold bg-primary-gold/20 text-primary-gold' : 'border-gray-600 text-gray-400 hover:border-primary-gold/50'}`}>
                            {lbl === 'home' ? '🏠' : lbl === 'work' ? '💼' : '📌'} {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Address Line 1 *</label>
                      <input type="text" value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} placeholder="House/Flat no., Building, Street" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Address Line 2</label>
                      <input type="text" value={newAddress.addressLine2} onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} placeholder="Area, Landmark (optional)" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">City *</label>
                        <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="Hyderabad" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">State *</label>
                        <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} placeholder="Telangana" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">PIN Code *</label>
                        <input type="text" value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} placeholder="500001" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <input type="tel" value={newAddress.phoneNumber} onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })} placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                      </div>
                    </div>

                    {/* Map Picker */}
                    <div>
                      <label className="block text-sm font-semibold mb-3">
                        📍 Pin Location on Map <span className="text-gray-500 font-normal">(optional – click map or drag pin)</span>
                      </label>
                      <LocationMapPicker
                        latitude={newAddress.latitude}
                        longitude={newAddress.longitude}
                        onChange={(lat, lng, addr) => setNewAddress((prev) => ({ ...prev, latitude: lat, longitude: lng, resolvedAddress: addr || prev.resolvedAddress }))}
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} className="w-4 h-4 accent-primary-gold" />
                      <span className="text-sm text-gray-300">Save this address to my profile</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input type="text" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold" />
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

          {/* ── Right Sidebar – Order Summary ── */}
          <div className="card sticky top-28 h-fit space-y-6">
            <h3 className="text-2xl font-bold">Order Summary</h3>

            {/* Items */}
            <div className="space-y-2 pb-4 border-b border-gray-700">
              {items.map((item) => (
                <div key={item.foodId} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.name} × {item.quantity}</span>
                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Coupon Code</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div>
                    <p className="font-bold text-green-400 text-sm">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-300">
                      {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `₹${appliedCoupon.discountValue} off`} — Save ₹{Math.round(appliedCoupon.discount)}
                    </p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-300 text-sm font-semibold ml-3 transition">✕ Remove</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold text-sm uppercase"
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 rounded-lg bg-primary-gold/20 text-primary-gold border border-primary-gold/50 hover:bg-primary-gold/30 font-semibold text-sm disabled:opacity-50 transition">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-red-400 text-xs">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pb-4 border-b border-gray-700">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="font-semibold">₹{subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Tax ({settings?.taxRate ?? 5}%)</span><span className="font-semibold">₹{tax}</span></div>
              {deliveryType === 'delivery' && <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery Fee</span><span className="font-semibold">₹{deliveryFee}</span></div>}
              {appliedCoupon && <div className="flex justify-between text-sm text-green-400"><span>Coupon ({appliedCoupon.code})</span><span>−₹{couponDiscount}</span></div>}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total</span>
              <span className="text-3xl font-bold text-primary-gold">₹{total}</span>
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={handlePlaceOrder} disabled={placing} className="w-full btn btn-primary disabled:opacity-50">
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
              <Link href="/cart"><button className="w-full btn btn-outline">Back to Cart</button></Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
