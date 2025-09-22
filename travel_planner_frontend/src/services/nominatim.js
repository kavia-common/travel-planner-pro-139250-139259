const BASE = 'https://nominatim.openstreetmap.org';

/**
 * Build headers that comply with Nominatim usage policy.
 * The app should send a meaningful User-Agent and Referer.
 * The UA can be overridden via REACT_APP_NOMINATIM_UA in .env.
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
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');

  let res;
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers: buildPolicyHeaders(),
    });
  } catch (networkErr) {
    throw new Error('Network error when contacting Nominatim: ' + networkErr.message);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const lower = (text || '').toLowerCase();
    const policyLikely = res.status === 429 || res.status === 403 || lower.includes('rate') || lower.includes('policy');
    if (policyLikely) {
      throw new Error(
        `Nominatim usage limit or policy issue (${res.status}).\n\n` +
        'Tips:\n- Try again later (rate limited),\n- Ensure a meaningful User-Agent via REACT_APP_NOMINATIM_UA in .env,\n' +
        '- Review policy: https://operations.osmfoundation.org/policies/nominatim/\n\n' +
        (text || res.statusText)
      );
    }
    throw new Error(`Nominatim search failed (${res.status}): ${text || res.statusText}`);
  }

  try {
    const json = await res.json();
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
