'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useStore from '@/store/useStore';
import { cartAPI, settingsAPI } from '@/lib/api';

export default function CartPage() {
  const items = useStore((s) => s.items);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const getTotalPrice = useStore((s) => s.getTotalPrice);
  const isLoggedIn = useStore((s) => s.isLoggedIn());
  const syncCartFromServer = useStore((s) => s.syncCartFromServer);

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    settingsAPI.get()
      .then((res) => setSettings(res.data?.settings))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Sync cart from server if logged in
    if (isLoggedIn) {
      syncCartFromServer();
    }
  }, [isLoggedIn, syncCartFromServer]);

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 0 ? (settings?.deliveryCharge ?? 30) : 0;
  const tax = Math.floor(subtotal * ((settings?.taxRate ?? 5) / 100));
  const total = subtotal + deliveryFee + tax;

  const handleUpdateQty = (foodId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(foodId);
    } else {
      updateQuantity(foodId, qty);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Shopping <span className="text-primary-gold">Cart</span>
            </h1>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.foodId} className="card flex items-center gap-6">
                    {item.image && item.image.startsWith('http') ? (
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" loading="lazy" />
                    ) : (
                      <div className="text-5xl w-20 h-20 flex items-center justify-center">{item.image || '🍽️'}</div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                      <p className="text-primary-gold font-semibold">₹{item.price}</p>
                      {item.selectedSize && <p className="text-gray-500 text-xs">Size: {item.selectedSize}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleUpdateQty(item.foodId, item.quantity - 1)} className="w-10 h-10 rounded-lg bg-primary-gold/20 hover:bg-primary-gold/30 text-primary-gold font-bold">−</button>
                      <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.foodId, item.quantity + 1)} className="w-10 h-10 rounded-lg bg-primary-gold/20 hover:bg-primary-gold/30 text-primary-gold font-bold">+</button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg mb-2">₹{item.price * item.quantity}</p>
                      <button onClick={() => removeFromCart(item.foodId)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="card sticky top-28 h-fit">
                <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-600">
                  <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="font-semibold">₹{subtotal}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Tax (5%)</span><span className="font-semibold">₹{tax}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Delivery Fee</span><span className="font-semibold">₹{deliveryFee}</span></div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-3xl font-bold text-primary-gold">₹{total}</span>
                </div>
                <Link href="/checkout"><button className="w-full btn btn-primary">Proceed to Checkout</button></Link>
                <Link href="/menu"><button className="w-full btn btn-outline mt-3">Continue Shopping</button></Link>
              </div>
            </div>
          ) : (
            <div className="card text-center py-20">
              <p className="text-4xl mb-4">🛒</p>
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-6">Add some delicious dishes to get started!</p>
              <Link href="/menu"><button className="btn btn-primary">Start Shopping</button></Link>
            </div>
          )}
        </div>
      </main>
  );
}
