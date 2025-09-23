# travel-planner-pro-139250-139259

This workspace contains the OceanTrip Planner React frontend built from scratch with free/open APIs and now includes local authentication screens (no backend).

- Frontend path: travel_planner_frontend

Quick start:
1) cd travel_planner_frontend
2) npm install
3) Copy .env.example to .env and (optionally) add your API keys
4) npm start

Authentication (localStorage only):
- Sign up and login pages are implemented at #signup and #login routes.
- Users and sessions are stored locally in the browser (localStorage) as JSON.
- Passwords are hashed with a simple demo hash and NOT secure for production.
- Per-user itineraries are persisted in localStorage and auto-loaded on login.

Environment variables:
- REACT_APP_NOMINATIM_UA: A descriptive User-Agent to respect Nominatim’s policy.
- REACT_APP_OPENTRIPMAP_API_KEY: Required for attractions from OpenTripMap.
- REACT_APP_ORS_API_KEY: Optional; if missing, routing falls back to straight-line polyline.

APIs used:
- OpenStreetMap Nominatim (search) – no key, but add REACT_APP_NOMINATIM_UA to respect policy
- OpenTripMap (attractions) – REACT_APP_OPENTRIPMAP_API_KEY recommended/required
- OpenRouteService (routing) – optional REACT_APP_ORS_API_KEY; falls back to straight polyline

Theme:
- Ocean Professional theme (primary blue #2563EB, amber accents #F59E0B), modern layout with top nav, panels, and a large map viewport.
