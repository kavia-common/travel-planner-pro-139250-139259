# OceanTrip Planner – React Frontend

A modern, authentication-free travel planner that uses only free/open APIs:
- Map: Leaflet with OpenStreetMap tiles
- Geocoding/Search: OpenStreetMap Nominatim
- Attractions: OpenTripMap
- Routing: OpenRouteService (optional key; falls back to simple polyline)

Theme: Ocean Professional (primary #2563EB, secondary #F59E0B)

## Quick Start

1) Install dependencies
```
npm install
```

2) (Optional) Create `.env` in project root:
```
REACT_APP_OPENTRIPMAP_API_KEY=your_opentripmap_key
REACT_APP_ORS_API_KEY=your_ors_key
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
- Route optimization button (calls ORS directions if key provided; otherwise draws straight polyline)
- Responsive, modern UI with subtle gradients and rounded cards

## Free/Open API Notes
See INTEGRATIONS.md for details, policies, and links.

## Styling
All components follow the Ocean Professional theme. See `src/App.css` for variables and layout rules.

