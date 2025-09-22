/**
 * OpenTripMap attractions helpers.
 * Requires REACT_APP_OPENTRIPMAP_API_KEY for full results. If missing, returns an empty array gracefully.
 */

// PUBLIC_INTERFACE
export async function fetchAttractionsByRadius({ lat, lon, radius = 3000, kinds = "interesting_places" }) {
  /** Fetch attractions around a coordinate.
   * Params:
   *  - lat, lon: numbers
   *  - radius: meters
   *  - kinds: OpenTripMap kinds filter
   * Returns: Array of POIs: { id, name, lat, lon }
   */
  const apiKey = process.env.REACT_APP_OPENTRIPMAP_API_KEY;
  if (!apiKey) {
    console.warn("REACT_APP_OPENTRIPMAP_API_KEY not set. Returning empty attractions list.");
    return [];
  }

  const base = "https://api.opentripmap.com/0.1/en/places/radius";
  const url = new URL(base);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("kinds", kinds);
  url.searchParams.set("rate", "2"); // popular
  url.searchParams.set("format", "json");
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`OpenTripMap fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // Normalize to {id, name, lat, lon}
  return (Array.isArray(data) ? data : []).map((d) => ({
    id: d.xid || `${d.point?.lat},${d.point?.lon}`,
    name: d.name || "Unnamed",
    lat: d.point?.lat ?? d.lat ?? 0,
    lon: d.point?.lon ?? d.lon ?? 0,
  }));
}
