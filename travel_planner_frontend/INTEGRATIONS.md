# Free/Open API Integrations

This frontend uses only free, open APIs. Please respect each provider's usage policies and rate limits.

APIs used:
- OpenStreetMap Nominatim (Geocoding/Search)
  - Endpoint: https://nominatim.openstreetmap.org/search
  - Usage: No key required. Provide meaningful user-agent and follow policy.
  - Policy: https://operations.osmfoundation.org/policies/nominatim/

- OpenTripMap (Attraction/POI data)
  - Endpoint: https://api.opentripmap.com/0.1/en/places
  - API key: Optional for higher rate limits. Without a key, you may experience stricter limits.
  - Sign up (free): https://opentripmap.io/
  - Env: REACT_APP_OPENTRIPMAP_API_KEY

- OpenRouteService (Routing)
  - Endpoint: https://api.openrouteservice.org/v2/directions/driving-car
  - API key: Required for road-based routing. If not set, the app will render a simple straight polyline between stops.
  - Free tier signup: https://openrouteservice.org/
  - Env: REACT_APP_ORS_API_KEY

Map Visualization:
- Leaflet with OpenStreetMap tiles: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
- Attribution is included in the map control automatically.

Environment Variables
- Create a .env file in the project root (same directory as package.json) and set:
  - REACT_APP_OPENTRIPMAP_API_KEY=<your_key> (optional)
  - REACT_APP_ORS_API_KEY=<your_key> (optional for simple mode; required for real routing)

If these are not set:
- Attractions will still load (rate limits may be stricter without OpenTripMap key).
- Routing will degrade gracefully to a straight line between itinerary stops.

