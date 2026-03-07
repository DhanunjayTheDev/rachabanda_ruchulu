'use client';

import { useState, useEffect } from 'react';
import { settingsAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

const defaultSettings = {
  restaurantName: 'Rachabanda Ruchulu',
  tagline: 'Authentic Telugu Cuisine',
  phone: '',
  email: '',
  address: '',
  deliveryRadius: 15,
  minimumOrder: 200,
  deliveryCharge: 40,
  freeDeliveryAbove: 500,
  taxRate: 5,
  openTime: '10:00',
  closeTime: '23:00',
  isOpen: true,
  acceptOnlinePayments: true,
  acceptCOD: true,
};

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.get();
        const data = res.data?.settings || res.data;
        if (data) setSettings({ ...defaultSettings, ...data });
      } catch (error: any) {
        addToast(
          error.response?.data?.message || 'Failed to load settings',
          'error',
          3000
        );
      }
      setLoading(false);
    };
    fetchSettings();
  }, [addToast]);

  const handleChange = (key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      setSaved(true);
      addToast('Settings saved successfully!', 'success', 3000);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to save settings',
        'error',
        3000
      );
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading settings...</div>;

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Settings <span className="text-primary-gold">Configuration</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Manage restaurant configuration and preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-accent-gold text-dark-bg font-bold hover:shadow-glow transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Restaurant Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={settings.restaurantName}
                  onChange={(e) =>
                    handleChange('restaurantName', e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Delivery Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  value={settings.deliveryRadius}
                  onChange={(e) =>
                    handleChange('deliveryRadius', Number(e.target.value))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Minimum Order (₹)
                </label>
                <input
                  type="number"
                  value={settings.minimumOrder}
                  onChange={(e) =>
                    handleChange('minimumOrder', Number(e.target.value))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  value={settings.deliveryCharge}
                  onChange={(e) =>
                    handleChange('deliveryCharge', Number(e.target.value))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Free Delivery Above (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeDeliveryAbove}
                  onChange={(e) =>
                    handleChange('freeDeliveryAbove', Number(e.target.value))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) =>
                    handleChange('taxRate', Number(e.target.value))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Operating Hours
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={settings.openTime}
                    onChange={(e) => handleChange('openTime', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={settings.closeTime}
                    onChange={(e) => handleChange('closeTime', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm text-gray-300">
                  Restaurant Currently Open
                </span>
                <button
                  onClick={() => handleChange('isOpen', !settings.isOpen)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    settings.isOpen ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      settings.isOpen ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Payment Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm text-gray-300">
                  Accept Online Payments
                </span>
                <button
                  onClick={() =>
                    handleChange('acceptOnlinePayments', !settings.acceptOnlinePayments)
                  }
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    settings.acceptOnlinePayments ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      settings.acceptOnlinePayments ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm text-gray-300">
                  Accept Cash on Delivery
                </span>
                <button
                  onClick={() =>
                    handleChange('acceptCOD', !settings.acceptCOD)
                  }
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    settings.acceptCOD ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      settings.acceptCOD ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
