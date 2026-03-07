'use client';

import { useEffect, useRef, useState } from 'react';

interface LocationMapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number, address?: string) => void;
}

const DEFAULT_LAT = 17.385;
const DEFAULT_LNG = 78.4867; // Hyderabad center

export default function LocationMapPicker({ latitude, longitude, onChange }: LocationMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Ensure map container exists and has dimensions
      if (!mapRef.current) return;

      try {
        // Fix default icon issue with Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const initLat = latitude || DEFAULT_LAT;
        const initLng = longitude || DEFAULT_LNG;

        const map = L.map(mapRef.current, { zoomControl: true }).setView([initLat, initLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);
        markerRef.current = marker;
        mapInstanceRef.current = map;

        const handleLocationChange = async (lat: number, lng: number) => {
          setLoading(true);
          const addr = await reverseGeocode(lat, lng);
          setResolvedAddress(addr);
          onChange(lat, lng, addr);
          setLoading(false);
        };

        // Drag marker handler
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          handleLocationChange(pos.lat, pos.lng);
        });

        // Click on map to move marker
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          handleLocationChange(lat, lng);
        });

        // If initial coords provided, reverse geocode
        if (latitude && longitude) {
          handleLocationChange(initLat, initLng);
        }
      } catch (err) {
        console.error('Failed to initialize map:', err);
      }
    }).catch((err) => {
      console.error('Failed to import leaflet:', err);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker if props change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  const handleUseMyLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 16);
        }
        const addr = await reverseGeocode(lat, lng);
        setResolvedAddress(addr);
        onChange(lat, lng, addr);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Click on the map or drag the pin to set your location</p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-gold/20 text-primary-gold border border-primary-gold/40 hover:bg-primary-gold/30 transition-all text-sm font-semibold disabled:opacity-50"
        >
          {loading ? '⏳ Locating...' : '📍 My Location'}
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-primary-gold/30"
        style={{ zIndex: 0 }}
      />

      {/* Resolved Address */}
      {resolvedAddress && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
          📍 {resolvedAddress}
        </div>
      )}
      {latitude && longitude && (
        <p className="text-xs text-gray-500">
          Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
