import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} />;
}

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Props {
  onLocationSelect?: (loc: { lat: number; lng: number; address: string }) => void;
  onChange?: (lat: number, lng: number, address: string) => void;
  initialPosition?: [number, number];
  latitude?: number;
  longitude?: number;
}

const LocationMapPicker = ({ onLocationSelect, onChange, initialPosition, latitude, longitude }: Props) => {
  const initPos: [number, number] = initialPosition || (latitude && longitude ? [latitude, longitude] : [17.385, 78.4867]);
  const [position, setPosition] = useState<[number, number]>(initPos);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!initialPosition) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, [initialPosition]);

  const notifyLocation = (lat: number, lng: number, addr: string) => {
    onLocationSelect?.({ lat, lng, address: addr });
    onChange?.(lat, lng, addr);
  };

  useEffect(() => {
    const reverseGeocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`
        );
        const data = await res.json();
        const addr = data.display_name || `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`;
        setAddress(addr);
        notifyLocation(position[0], position[1], addr);
      } catch {
        const addr = `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`;
        setAddress(addr);
        notifyLocation(position[0], position[1], addr);
      }
    };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(reverseGeocode, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [position, onLocationSelect, onChange]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch {}
    setLoading(false);
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => setLoading(false)
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search location..."
          className="input flex-1"
        />
        <button onClick={handleSearch} disabled={loading} className="btn btn-primary px-4">
          {loading ? '...' : '🔍'}
        </button>
        <button onClick={handleCurrentLocation} disabled={loading} className="btn btn-outline px-4" title="Use current location">
          📍
        </button>
      </div>

      <div className="h-64 rounded-xl overflow-hidden border border-primary-gold/20">
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapCenter center={position} />
        </MapContainer>
      </div>

      {address && (
        <p className="text-sm text-gray-400 truncate">📍 {address}</p>
      )}
    </div>
  );
};

export default LocationMapPicker;
