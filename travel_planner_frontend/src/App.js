import React, { useMemo, useState } from 'react';
import './App.css';
import './leaflet.css';
import MapView from './components/MapView';
import SearchPanel from './components/SearchPanel';
import ItineraryPanel from './components/ItineraryPanel';
import { geocodeSearch } from './services/nominatim';
import { fetchAttractionsByRadius } from './services/opentripmap';
import { getOptimizedRoute } from './services/routing';

// PUBLIC_INTERFACE
function App() {
  /** App-level state */
  const [center, setCenter] = useState([48.8566, 2.3522]); // Paris default
  const [zoom, setZoom] = useState(12);
  const [placeQuery, setPlaceQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [poi, setPoi] = useState([]); // attractions from OpenTripMap
  const [routeGeojson, setRouteGeojson] = useState(null);

  const [itinerary, setItinerary] = useState([]); // [{id, name, lat, lon}]
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Derived bounds center from itinerary (used to adjust view when route updates)
  const mapKey = useMemo(() => itinerary.map(p => p.id).join('-'), [itinerary]);

  // PUBLIC_INTERFACE
  const handleLocate = async () => {
    if (!placeQuery) return;
    setSearching(true);
    try {
      const res = await geocodeSearch(placeQuery);
      if (res && res.length) {
        const first = res[0];
        const lat = parseFloat(first.lat);
        const lon = parseFloat(first.lon);
        setCenter([lat, lon]);
        setZoom(13);
        // Auto-load attractions around this point
        const attractions = await fetchAttractionsByRadius({ lat, lon, radius: 3000, kinds: 'interesting_places' });
        setPoi(attractions);
      }
    } catch (e) {
      console.error('Locate error', e);
      const msg = (e && e.message) ? e.message : 'Unknown error';
      alert(`Failed to search location.\n\nDetails: ${msg}\n\nTips:\n- Try a different query (e.g., City, Country)\n- Ensure network connectivity\n- If this persists, you may be rate limited by Nominatim. Please try again later.`);
    } finally {
      setSearching(false);
    }
  };

  // PUBLIC_INTERFACE
  const addToItinerary = (item) => {
    // item: {id, name, lat, lon}
    setItinerary(prev => {
      if (prev.find(x => x.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  // PUBLIC_INTERFACE
  const removeFromItinerary = (id) => {
    setItinerary(prev => prev.filter(p => p.id !== id));
  };

  // PUBLIC_INTERFACE
  const reorderItinerary = (fromIndex, toIndex) => {
    setItinerary(prev => {
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  };

  // PUBLIC_INTERFACE
  const clearItinerary = () => {
    setItinerary([]);
    setRouteGeojson(null);
  };

  // PUBLIC_INTERFACE
  const optimizeRoute = async () => {
    if (itinerary.length < 2) {
      alert('Add at least two places to optimize a route.');
      return;
    }
    try {
      const route = await getOptimizedRoute(itinerary);
      setRouteGeojson(route);
    } catch (e) {
      console.error(e);
      alert('Failed to optimize route. Ensure routing API key is set and try again.');
    }
  };

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="dot" />
            OceanTrip Planner
            <span className="badge" title="Free & Open APIs">OSS</span>
          </div>
          <div className="searchbar">
            <input
              className="input"
              placeholder="Search city or place (e.g., Paris, Eiffel Tower)"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocate()}
              aria-label="Search place"
            />
            <button className="btn" onClick={handleLocate} disabled={searching}>
              {searching ? 'Searching…' : 'Locate'}
            </button>
          </div>
          <div className="row">
            <a
              className="btn btn-secondary"
              href="https://operations.osmfoundation.org/policies/nominatim/"
              target="_blank" rel="noreferrer"
              title="Nominatim Policy"
            >
              API Policy
            </a>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="panel">
          <div className="panel-header">Attraction Search</div>
          <div className="panel-body">
            <SearchPanel
              center={center}
              onResults={setPoi}
              onAdd={addToItinerary}
            />
            <div className="sep" />
            <div className="muted" style={{fontSize: 12}}>
              Data via OpenTripMap (free). Please respect rate limits.
            </div>
          </div>
        </div>

        <div className="map-wrapper">
          <MapView
            key={mapKey}
            center={center}
            zoom={zoom}
            poi={poi}
            itinerary={itinerary}
            route={routeGeojson}
            onSelect={(id) => setSelectedItemId(id)}
          />
        </div>

        <div className="panel">
          <div className="panel-header">Itinerary & Route</div>
          <div className="panel-body">
            <ItineraryPanel
              items={itinerary}
              selectedId={selectedItemId}
              onRemove={removeFromItinerary}
              onReorder={reorderItinerary}
              onClear={clearItinerary}
              onOptimize={optimizeRoute}
            />
            <div className="sep" />
            <div className="muted" style={{fontSize: 12}}>
              Routing via OpenRouteService (free tier requires API key).
              Set REACT_APP_ORS_API_KEY in your environment for routing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
