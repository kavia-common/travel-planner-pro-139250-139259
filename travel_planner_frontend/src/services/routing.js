const ORS_BASE = 'https://api.openrouteservice.org/v2/directions/driving-car';

// PUBLIC_INTERFACE
export async function getOptimizedRoute(itinerary) {
  /** Build a route by ordering given itinerary sequence (simple direct route).
   * If you need true optimization (TSP), OpenRouteService has optimization API (v2/optimization),
   * but it may require additional quotas. Here we use the order as provided.
   * If REACT_APP_ORS_API_KEY is set, we call ORS Directions to get a proper route geometry.
   */
  const key = process.env.REACT_APP_ORS_API_KEY;
  if (!key) {
    // Fallback: create a simple LineString GeoJSON without calling any API.
    const coords = itinerary.map(p => [p.lon, p.lat]);
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { name: 'Simple polyline (no routing, set ORS key for real roads)' },
        geometry: { type: 'LineString', coordinates: coords }
      }]
    };
  }

  // Prepare body for ORS Directions
  const coordinates = itinerary.map(p => [p.lon, p.lat]);
  const res = await fetch(ORS_BASE + '/geojson', {
    method: 'POST',
    headers: {
      'Authorization': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ coordinates })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('OpenRouteService error: ' + text);
  }
  const geojson = await res.json();
  // Ensure we return a FeatureCollection
  return geojson.type === 'FeatureCollection' ? geojson : {
    type: 'FeatureCollection',
    features: [geojson]
  };
}
