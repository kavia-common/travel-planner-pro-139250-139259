import React from "react";

/**
 * PUBLIC_INTERFACE
 * MapView
 * Minimal placeholder that lists coordinates and route info.
 * Replace with react-leaflet implementation later.
 */
export default function MapView({ center, zoom, poi, itinerary, route, onSelect }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: 8 }}>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
        Map placeholder (Leaflet UI not yet implemented). Center: {center?.join(", ")} | Zoom: {zoom}
      </div>
      <div style={{ overflow: "auto", flex: 1 }}>
        <div className="card" style={{ marginBottom: 8 }}>
          <strong>POIs:</strong>
          <ul>
            {poi?.map((p) => (
              <li key={p.id}>
                <button className="btn btn-secondary" onClick={() => onSelect?.(p.id)} style={{ marginRight: 6 }}>
                  Select
                </button>
                {p.name} ({p.lat?.toFixed?.(4)}, {p.lon?.toFixed?.(4)})
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <strong>Route:</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>{route ? JSON.stringify(route).slice(0, 400) + "..." : "None"}</pre>
        </div>
      </div>
    </div>
  );
}
