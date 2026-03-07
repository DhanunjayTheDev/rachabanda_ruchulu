'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderAPI } from '@/lib/api';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: '✓' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗' },
  { key: 'delivered', label: 'Delivered', icon: '✓' },
];

function getActiveStep(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx + 1 : 1;
}

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(params.id);
        setOrder(res.data?.order || res.data);
      } catch {
        setError('Order not found');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-12 bg-dark-card rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-dark-card rounded-xl"></div>
            <div className="h-64 bg-dark-card rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto card text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <h2 className="text-2xl font-bold mb-4">{error || 'Order not found'}</h2>
          <Link href="/profile"><button className="btn btn-primary">Go to Profile</button></Link>
        </div>
      </main>
    );
  }

  const activeStep = getActiveStep(order.status || 'placed');
  const items = order.items || [];
  const total = order.total || order.totalAmount || 0;

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">Track <span className="text-primary-gold">Order</span></h1>
            <p className="text-gray-400">Order ID: {(order._id || params.id).slice(-8)}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Timeline */}
              <div className="card">
                <h3 className="text-2xl font-bold mb-8">Order Timeline</h3>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-gold to-gray-600"></div>
                  <div className="space-y-6">
                    {statusSteps.map((step, index) => (
                      <div key={step.key} className="relative pl-20">
                        <div className={`absolute -left-3 top-0 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${index + 1 <= activeStep ? 'bg-primary-gold text-secondary-dark-brown shadow-lg shadow-primary-gold' : 'bg-gray-700 text-gray-400'}`}>
                          {step.icon}
                        </div>
                        <div className={`transition-all ${index + 1 <= activeStep ? 'text-white' : 'text-gray-400'}`}>
                          <div className="font-bold text-lg">{step.label}</div>
                          {index + 1 === activeStep && <div className="mt-1 text-primary-gold text-sm">Current Status</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className="card">
                  <h3 className="text-2xl font-bold mb-6">Delivery Address</h3>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">📍</div>
                    <p className="font-semibold text-lg">{typeof order.deliveryAddress === 'string' ? order.deliveryAddress : order.deliveryAddress.address || ''}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="card sticky top-28 h-fit">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-600">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.food?.name || item.name || 'Item'} x {item.quantity}</span>
                    <span className="font-semibold">₹{(item.price || 0) * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-primary-gold">₹{total}</span>
              </div>
              <div className={`px-4 py-3 rounded-lg text-center font-bold mb-4 ${activeStep >= statusSteps.length ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {activeStep >= statusSteps.length ? '✓ Delivered' : `🚀 ${statusSteps[activeStep - 1]?.label || 'Processing'}`}
              </div>
              <button className="w-full px-4 py-2 rounded-lg border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10 transition-all font-semibold">Need Help? Contact Support</button>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/menu"><button className="btn btn-primary">Continue Shopping</button></Link>
          </div>
        </div>
      </main>
  );
}
