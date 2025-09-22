const BASE = 'https://nominatim.openstreetmap.org';

/**
 * Build headers that comply with Nominatim usage policy.
 * The app should send a meaningful User-Agent and Referer.
 * In production, consider making these values configurable via env.
 */
function buildPolicyHeaders() {
  const userAgent =
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_NOMINATIM_UA) ||
    'OceanTrip Planner (contact: example@example.com)';
  const referer =
    (typeof window !== 'undefined' && window.location && window.location.origin) ||
    'http://localhost';

  return {
    'Accept': 'application/json',
    'User-Agent': userAgent,
    'Referer': referer
  };
}

// PUBLIC_INTERFACE
export async function geocodeSearch(query) {
  /** Geocode a place string using OSM Nominatim (no key). Returns array of places. */
  if (!query || !query.trim()) return [];

  const url = new URL(BASE + '/search');
  url.searchParams.set('q', query.trim());
  // Prefer jsonv2; some proxies and CORS setups behave better with it
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  // Request geojson polygon only if needed. Keep disabled to reduce payload.
  // url.searchParams.set('polygon_geojson', '1');

  let res;
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers: buildPolicyHeaders(),
      // CORS preflight not needed for simple GET + simple headers
      // mode: 'cors' // default in browsers
    });
  } catch (networkErr) {
    // Network-level error (e.g., CORS blocked or offline)
    throw new Error('Network error when contacting Nominatim: ' + networkErr.message);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Nominatim search failed (${res.status}): ${text || res.statusText}`);
  }

  try {
    const json = await res.json();
    // Normalize lat/lon to numbers; ensure array
    if (!Array.isArray(json)) return [];
    return json.map(p => ({
      ...p,
      lat: typeof p.lat === 'string' ? parseFloat(p.lat) : p.lat,
      lon: typeof p.lon === 'string' ? parseFloat(p.lon) : p.lon
    }));
  } catch (parseErr) {
    throw new Error('Invalid response from Nominatim (JSON parse failed)');
  }
}
