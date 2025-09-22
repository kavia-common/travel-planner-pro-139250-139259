import React, { useState } from "react";
import { geocodeSearch } from "../services/nominatim";
import { fetchAttractionsByRadius } from "../services/opentripmap";

/**
 * PUBLIC_INTERFACE
 * SearchPanel
 * - Search attractions near the provided center
 * - Search arbitrary places via Nominatim
 */
export default function SearchPanel({ center, onResults, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState("");

  const searchNearby = async () => {
    if (!center) return;
    setLoading(true);
    try {
      const [lat, lon] = center;
      const list = await fetchAttractionsByRadius({ lat, lon, radius: 3000, kinds: "interesting_places" });
      onResults?.(list);
    } catch (e) {
      console.error(e);
      alert("Failed to load attractions (OpenTripMap). Check API key.");
    } finally {
      setLoading(false);
    }
  };

  const searchPlaces = async () => {
    if (!term) return;
    setLoading(true);
    try {
      const places = await geocodeSearch(term);
      const normalized = places.map((p) => ({
        id: p.place_id,
        name: p.display_name,
        lat: parseFloat(p.lat),
        lon: parseFloat(p.lon),
      }));
      onResults?.(normalized);
    } catch (e) {
      console.error(e);
      alert("Failed to search places (Nominatim).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col">
      <div className="row">
        <button className="btn" onClick={searchNearby} disabled={loading}>
          {loading ? "Loading…" : "Nearby attractions"}
        </button>
      </div>
      <div className="row">
        <input
          className="input"
          placeholder="Search places (Nominatim)…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchPlaces()}
        />
        <button className="btn" onClick={searchPlaces} disabled={loading}>
          Search
        </button>
      </div>
      <div className="muted" style={{ fontSize: 12 }}>
        Tip: Set REACT_APP_NOMINATIM_UA and REACT_APP_OPENTRIPMAP_API_KEY in your .env for production use.
      </div>
      <div className="sep" />
      <div className="card">
        <strong>How to use:</strong>
        <ol>
          <li>Use the top bar to locate a city.</li>
          <li>Click "Nearby attractions" to fetch POIs near the current center.</li>
          <li>On the map, click a marker and press “Select” to add it to the itinerary.</li>
        </ol>
      </div>
    </div>
  );
}
