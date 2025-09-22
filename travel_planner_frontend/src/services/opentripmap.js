const BASE = 'https://api.opentripmap.com/0.1/en/places';

/**
 * Resolve OpenTripMap API key from environment (optional but increasingly required).
 */
function getApiKey() {
  return process.env.REACT_APP_OPENTRIPMAP_API_KEY || '';
}

/**
 * Fetch JSON with improved error handling for auth-required responses.
 */
async function getJson(url, { missingKeyHint } = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    throw new Error('Network error when contacting OpenTripMap: ' + err.message);
  }

  // Attempt to parse body text for better diagnostics on failure
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  if (!res.ok) {
    let text = '';
    try { text = await res.text(); } catch (_) { /* ignore */ }

    // Detect typical auth failures
    const bodyLower = (text || '').toLowerCase();
    const authLikely = res.status === 401 || res.status === 403 || bodyLower.includes('auth') || bodyLower.includes('apikey') || bodyLower.includes('api key') || bodyLower.includes('requires authentication');

    if (authLikely) {
      // Provide actionable guidance
      const extra = missingKeyHint
        ? `\n\nAction: ${missingKeyHint}`
        : '\n\nAction: Set REACT_APP_OPENTRIPMAP_API_KEY in a .env file at the project root and restart the dev server.';
      throw new Error(`OpenTripMap authentication required (${res.status}).${extra}`);
    }

    throw new Error(`OpenTripMap API failed (${res.status}): ${text || res.statusText}`);
  }

  try {
    return isJson ? await res.json() : JSON.parse(await res.text());
  } catch {
    throw new Error('OpenTripMap returned an invalid JSON response.');
  }
}

// PUBLIC_INTERFACE
export async function fetchAttractionsByRadius({ lat, lon, radius = 3000, kinds = 'interesting_places', limit = 30 }) {
  const apikey = getApiKey();
  const url = new URL(`${BASE}/radius`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('kinds', kinds);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  if (apikey) url.searchParams.set('apikey', apikey);

  const missingKeyHint = !apikey
    ? 'You are using OpenTripMap without an API key. Sign up for a free key at https://opentripmap.io/ and set REACT_APP_OPENTRIPMAP_API_KEY in your .env.'
    : null;

  const list = await getJson(url.toString(), { missingKeyHint });
  // Enrich details for each xid (optional for this version we map minimally)
  return list.map((p) => ({
    id: p.xid || `${p.point?.lat ?? p.lat},${p.point?.lon ?? p.lon}`,
    name: p.name || 'Attraction',
    lat: p.point?.lat ?? p.lat,
    lon: p.point?.lon ?? p.lon,
    kinds: p.kinds,
    rate: p.rate
  }));
}
