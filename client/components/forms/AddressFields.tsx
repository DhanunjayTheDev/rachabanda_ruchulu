'use client';

import { useState, useEffect } from 'react';

interface AddressFieldsProps {
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  onChange: (address: any) => void;
  includeGeolocation?: boolean;
}

export default function AddressFields({ address, onChange, includeGeolocation = true }: AddressFieldsProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoSuccess, setGeoSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    onChange({ ...address, [field]: value });
  };

  const requestGeolocation = () => {
    setGeoLoading(true);
    setGeoError('');
    setGeoSuccess(false);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({ ...address, latitude, longitude });
        setGeoSuccess(true);
        setGeoLoading(false);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setGeoSuccess(false), 3000);
      },
      (error) => {
        let errorMsg = 'Failed to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable location in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable';
        }
        setGeoError(errorMsg);
        setGeoLoading(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Geolocation Button */}
      {includeGeolocation && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={requestGeolocation}
            disabled={geoLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-gold/20 text-primary-gold border border-primary-gold/50 hover:bg-primary-gold/30 transition-all disabled:opacity-50"
          >
            {geoLoading ? '📍 Getting location...' : '📍 Use My Location'}
          </button>
        </div>
      )}

      {/* Success/Error Messages */}
      {geoSuccess && (
        <div className="p-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm">
          ✓ Location captured successfully! Coordinates saved.
        </div>
      )}
      {geoError && (
        <div className="p-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">
          ✕ {geoError}
        </div>
      )}

      {/* Address Fields */}
      <div>
        <label className="block text-sm font-semibold mb-2">Street Address *</label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => handleChange('street', e.target.value)}
          placeholder="House number, building name, street name"
          className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">City *</label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
            className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">State *</label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State"
            className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Pincode *</label>
        <input
          type="text"
          value={address.pincode}
          onChange={(e) => handleChange('pincode', e.target.value)}
          placeholder="6-digit pincode"
          className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
          required
          pattern="[0-9]{6}"
        />
      </div>

      {/* Coordinates Display */}
      {address.latitude && address.longitude && (
        <div className="p-3 rounded-lg bg-primary-gold/10 border border-primary-gold/30 text-sm">
          <div className="font-semibold text-primary-gold mb-1">📍 Coordinates Saved</div>
          <div className="text-gray-400 text-xs">
            Latitude: {address.latitude.toFixed(4)}, Longitude: {address.longitude.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}
