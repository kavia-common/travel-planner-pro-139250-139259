/**
 * Nominatim search and reverse utilities.
 * Uses OpenStreetMap's Nominatim API with an optional custom User-Agent via REACT_APP_NOMINATIM_UA.
 */

// PUBLIC_INTERFACE
export async function geocodeSearch(query) {
  /** Geocode a free-text place query using Nominatim.
   * Params:
   *  - query: string
   * Returns: Array of places (lat, lon, display_name, etc.)
   */
  const base = "https://nominatim.openstreetmap.org/search";
  const url = new URL(base);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");

  const headers = {};
  const ua = process.env.REACT_APP_NOMINATIM_UA || "OceanTripPlanner/1.0 (respectful use; no heavy traffic)";
  headers["Accept"] = "application/json";
  headers["User-Agent"] = ua;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(`Nominatim search failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
