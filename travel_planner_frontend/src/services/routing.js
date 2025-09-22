/**
 * Routing helpers leveraging OpenRouteService if available.
 * If REACT_APP_ORS_API_KEY is not provided, falls back to a straight LineString between points.
 */

// PUBLIC_INTERFACE
export async function getOptimizedRoute(itinerary) {
  /** Build a route GeoJSON between ordered itinerary waypoints.
   * Params:
   *  - itinerary: Array<{ lat:number, lon:number }>
   * Returns: GeoJSON FeatureCollection or null if not enough points
   */
  if (!Array.isArray(itinerary) || itinerary.length < 2) return null;

  const key = process.env.REACT_APP_ORS_API_KEY;
  if (!key) {
    // Fallback: straight polyline
    const coords = itinerary.map((p) => [p.lon, p.lat]);
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: { mode: "fallback-straight" },
        },
      ],
    };
  }

  // Build ORS request (simple directions between ordered points)
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
  const body = {
    coordinates: itinerary.map((p) => [p.lon, p.lat]),
    optimize_waypoints: false, // set true for optimization if needed; may require different endpoint/params
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": key,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`OpenRouteService failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}
