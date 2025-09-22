const BASE = 'https://api.opentripmap.com/0.1/en/places';

function getApiKey() {
  // Optional API key for higher rate limits. Can be omitted.
  return process.env.REACT_APP_OPENTRIPMAP_API_KEY || '';
}

async function getJson(url) {
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
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenTripMap API failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
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

  const list = await getJson(url.toString());
  // Enrich details for each xid (optional for this version we map minimally)
  return list.map((p) => ({
    id: p.xid || `${p.point.lat},${p.point.lon}`,
    name: p.name || 'Attraction',
    lat: p.point?.lat ?? p.lat,
    lon: p.point?.lon ?? p.lon,
    kinds: p.kinds,
    rate: p.rate
  }));
}
