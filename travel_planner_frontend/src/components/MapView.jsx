import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

/**
 * PUBLIC_INTERFACE
 * MapView
 * Renders a Leaflet map with:
 * - OSM tiles
 * - Markers for POIs (left panel/search)
 * - Markers for itinerary items
 * - Optional route polyline (GeoJSON or fallback straight line)
 *
 * Props:
 *  - center: [lat, lon]
 *  - zoom: number
 *  - poi: Array<{ id, name, lat, lon }>
 *  - itinerary: Array<{ id, name, lat, lon }>
 *  - route: GeoJSON FeatureCollection | null
 *  - onSelect: function(id) -> visually select/highlight an item (optional)
 *  - onAdd: function(item) -> add an item to itinerary (required for Select)
 */
export default function MapView({ center, zoom, poi, itinerary, route, onSelect, onAdd }) {
  // Fix default Leaflet icon paths for CRA bundling
  const defaultIcon = useMemo(() => {
    const icon = new L.Icon({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    return icon;
  }, []);

  const poiIcon = defaultIcon; // could customize color later

  const itineraryIcon = useMemo(() => {
    // Slightly different icon (same base with a hue rotate via filter in style)
    return defaultIcon;
  }, [defaultIcon]);

  const RouteRenderer = ({ featureCollection }) => {
    if (!featureCollection || !featureCollection.features) return null;
    const lines = featureCollection.features
      .filter((f) => f.geometry?.type === "LineString")
      .map((f, idx) => (
        <Polyline
          key={`route-${idx}`}
          positions={f.geometry.coordinates.map((c) => [c[1], c[0]])}
          pathOptions={{ color: "#2563EB", weight: 4, opacity: 0.85 }}
        />
      ));
    return <>{lines}</>;
  };

  const FlyToCenter = ({ target, zoomLevel }) => {
    const map = useMap();
    React.useEffect(() => {
      if (target && Array.isArray(target) && target.length === 2) {
        map.setView(target, zoomLevel ?? map.getZoom(), { animate: true });
      }
    }, [map, target, zoomLevel]);
    return null;
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={center || [0, 0]}
        zoom={zoom || 12}
        className="leaflet-container"
        style={{ width: "100%", height: "100%" }}
      >
        <FlyToCenter target={center} zoomLevel={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* POI markers */}
        {(poi || []).map((p) => (
          <Marker
            key={`poi-${p.id}`}
            position={[p.lat, p.lon]}
            icon={poiIcon}
            eventHandlers={{
              click: () => onSelect?.(p.id),
            }}
          >
            <Popup>
              <div className="col" style={{ minWidth: 180 }}>
                <strong>{p.name || "Unnamed"}</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  {Number(p.lat)?.toFixed?.(4)}, {Number(p.lon)?.toFixed?.(4)}
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button
                    className="btn"
                    onClick={() => onAdd?.(p)}
                    title="Add to itinerary"
                  >
                    Select
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Itinerary markers */}
        {(itinerary || []).map((p, idx) => (
          <Marker
            key={`iti-${p.id}`}
            position={[p.lat, p.lon]}
            icon={itineraryIcon}
            eventHandlers={{
              click: () => onSelect?.(p.id),
            }}
          >
            <Popup>
              <div className="col" style={{ minWidth: 180 }}>
                <strong>{idx + 1}. {p.name || "Stop"}</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  {Number(p.lat)?.toFixed?.(4)}, {Number(p.lon)?.toFixed?.(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route renderer (if provided) */}
        {route ? <RouteRenderer featureCollection={route} /> : null}
      </MapContainer>
    </div>
  );
}
