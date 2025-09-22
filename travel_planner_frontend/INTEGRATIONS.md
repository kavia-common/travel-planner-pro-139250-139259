# Free/Open API Integrations

This frontend uses only free, open APIs. Please respect each provider's usage policies and rate limits. There are no authentication screens in this app.

APIs used:
- OpenStreetMap Nominatim (Geocoding/Search)
  - Endpoint: https://nominatim.openstreetmap.org/search
  - Usage: No key required. Provide meaningful user-agent and follow policy.
  - Policy: https://operations.osmfoundation.org/policies/nominatim/
  - Env (recommended): REACT_APP_NOMINATIM_UA (sets a meaningful User-Agent header)

- OpenTripMap (Attraction/POI data)
  - Endpoint: https://api.opentripmap.com/0.1/en/places
  - API key: Increasingly required for reliable access. Without a key, you may receive errors like "this api requires authentication" or face strict rate limits.
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
  - REACT_APP_OPENTRIPMAP_API_KEY=<your_key> (recommended/required for reliable attractions)
  - REACT_APP_ORS_API_KEY=<your_key> (optional for simple mode; required for real routing)
  - REACT_APP_NOMINATIM_UA="OceanTrip Planner (contact: you@example.com)" (recommended)

See .env.example for a ready-to-copy template.

Troubleshooting
- "This API requires authentication" when searching attractions:
  - Cause: OpenTripMap rejected the request without a key or due to policy changes.
  - Fix:
    1) Obtain a free key at https://opentripmap.io/
    2) Create/Update .env in the project root (same folder as package.json)
    3) Set REACT_APP_OPENTRIPMAP_API_KEY=<your_key> (must include REACT_APP_ prefix)
    4) Stop the dev server and run npm start again (CRA loads env at startup)
    5) Open DevTools → Network and confirm requests to /places/* include ?apikey=
  - CI/Production builds:
    - Ensure the env var is set at build time before running `npm run build`, or inject via your hosting provider's env mechanism and rebuild.
- Nominatim policy/rate limit (429/403):
  - Set REACT_APP_NOMINATIM_UA to a meaningful value with contact info.
  - Wait and retry later if rate-limited, and follow policy.
- Routing returns a straight line:
  - Set REACT_APP_ORS_API_KEY to enable real road routing via OpenRouteService.
