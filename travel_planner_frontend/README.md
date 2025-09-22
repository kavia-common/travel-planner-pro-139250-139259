# OceanTrip Planner – React Frontend

A modern, authentication-free travel planner that uses only free/open APIs:
- Map: Leaflet with OpenStreetMap tiles
- Geocoding/Search: OpenStreetMap Nominatim
- Attractions: OpenTripMap
- Routing: OpenRouteService (optional key; falls back to simple polyline)

No authentication: There are no login or signup screens, and no auth flows anywhere.

Theme: Ocean Professional (primary #2563EB, secondary #F59E0B)

## Quick Start

1) Install dependencies
```
npm install
```

2) Create `.env` in project root (optional but recommended). You can copy from `.env.example`:
```
REACT_APP_OPENTRIPMAP_API_KEY=your_opentripmap_key
REACT_APP_ORS_API_KEY=your_ors_key
REACT_APP_NOMINATIM_UA="OceanTrip Planner (contact: you@example.com)"
```

3) Run dev server
```
npm start
```

Open http://localhost:3000

## Features
- Main page with map viewport
- Attraction search panel (radius + category)
- Itinerary management (add/remove/reorder/clear)
- Route button to draw a route between stops (uses ORS if key; otherwise a straight polyline)
- Responsive, modern UI with subtle gradients and rounded cards

## Free/Open API Notes
See INTEGRATIONS.md for details, policies, and links.

## Styling
All components follow the Ocean Professional theme. See `src/App.css` for variables and layout rules.

