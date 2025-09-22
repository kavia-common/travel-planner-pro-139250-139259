const BASE = 'https://nominatim.openstreetmap.org';

// PUBLIC_INTERFACE
export async function geocodeSearch(query) {
  /** Geocode a place string using OSM Nominatim (no key). Returns array of places. */
  const url = new URL(BASE + '/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      // Please provide a valid referer/user-agent in production
    }
  });
  if (!res.ok) throw new Error('Nominatim search failed');
  return res.json();
}
