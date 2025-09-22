import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON } from 'react-leaflet';
import L from 'leaflet';

// PUBLIC_INTERFACE
export default function MapView({ center, zoom = 12, poi = [], itinerary = [], route = null, onSelect }) {
  /** Configure default marker icon to avoid missing images in Leaflet + CRA */
  const DefaultIcon = useMemo(() => {
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    return new L.Icon({
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }, []);

  // Apply default icon
  L.Marker.prototype.options.icon = DefaultIcon;

  const itineraryPositions = itinerary.map(p => [p.lat, p.lon]);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {poi.map(p => (
        <Marker key={`poi-${p.id}`} position={[p.lat, p.lon]}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.name || 'Attraction'}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                {p.kinds ? p.kinds.split(',').slice(0,3).join(', ') : 'POI'}
              </div>
              <button className="btn" onClick={() => onSelect?.(p.id)}>Select</button>
            </div>
          </Popup>
        </Marker>
      ))}

      {itinerary.map((p, idx) => (
        <Marker key={`it-${p.id}`} position={[p.lat, p.lon]}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div className="badge">Stop #{idx + 1}</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{p.lat.toFixed(5)}, {p.lon.toFixed(5)}</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {itineraryPositions.length > 1 && !route && (
        <Polyline positions={itineraryPositions} pathOptions={{ color: '#2563EB', weight: 4, opacity: 0.7 }} />
      )}

      {route && (
        <GeoJSON data={route} style={{ color: '#2563EB', weight: 5, opacity: 0.85 }} />
      )}
    </MapContainer>
  );
}
