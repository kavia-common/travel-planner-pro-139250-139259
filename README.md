# travel-planner-pro-139250-139259

This workspace contains the OceanTrip Planner React frontend built from scratch with free/open APIs and no authentication screens.

- Frontend path: travel_planner_frontend

Quick start:
1) cd travel_planner_frontend
2) npm install
3) Copy .env.example to .env and (optionally) add your API keys
4) npm start

APIs used:
- OpenStreetMap Nominatim (search) – no key, but add REACT_APP_NOMINATIM_UA to respect policy
- OpenTripMap (attractions) – REACT_APP_OPENTRIPMAP_API_KEY recommended/required
- OpenRouteService (routing) – optional REACT_APP_ORS_API_KEY; falls back to straight polyline
