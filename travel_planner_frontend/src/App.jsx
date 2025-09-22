import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import { geocodeSearch } from "./services/nominatim";
import { fetchAttractionsByRadius } from "./services/opentripmap";
import { getOptimizedRoute } from "./services/routing";
import { getSession, logout, saveUserItinerary, loadLastUserItinerary } from "./services/auth";
import MapView from "./components/MapView";
import SearchPanel from "./components/SearchPanel";
import ItineraryPanel from "./components/ItineraryPanel";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/**
 * PUBLIC_INTERFACE
 * App
 * Now includes simple client-side routing for /login, /signup, and main planner.
 * - Stores session and per-user itinerary to localStorage
 */
export default function App() {
  // rudimentary client-side routing using location.hash to avoid extra deps
  const [route, setRoute] = useState(() => window.location.hash.replace("#", "") || "planner");
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || "planner");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // redirect helpers
  const go = (to) => {
    window.location.hash = to || "planner";
  };

  // Planner state
  const [center, setCenter] = useState([48.8566, 2.3522]); // Paris default
  const [zoom, setZoom] = useState(12);
  const [placeQuery, setPlaceQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const [poi, setPoi] = useState([]);
  const [routeGeojson, setRouteGeojson] = useState(null);
  const [itinerary, setItinerary] = useState([]); // {id, name, lat, lon}
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Load last itinerary for this user on session change
  useEffect(() => {
    if (session?.userId) {
      const last = loadLastUserItinerary(session.userId);
      if (Array.isArray(last)) setItinerary(last);
    } else {
      setItinerary([]); // clear if logged out
    }
  }, [session?.userId]);

  // Persist itinerary for the logged in user whenever it changes
  useEffect(() => {
    if (session?.userId) {
      saveUserItinerary(session.userId, itinerary);
    }
  }, [session?.userId, itinerary]);

  const mapKey = useMemo(() => itinerary.map((p) => p.id).join("-"), [itinerary]);

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
        // preload attractions nearby
        const attractions = await fetchAttractionsByRadius({
          lat,
          lon,
          radius: 3000,
          kinds: "interesting_places",
        });
        setPoi(attractions);
      }
    } catch (e) {
      console.error("Locate error", e);
      const msg = e?.message || "Unknown error";
      alert(
        `Failed to search location.\n\nDetails: ${msg}\n\nTips:\n- Try a different query (e.g., City, Country)\n- Ensure network connectivity\n- If this persists, you may be rate limited by Nominatim. Try again later.`
      );
    } finally {
      setSearching(false);
    }
  };

  // PUBLIC_INTERFACE
  const addToItinerary = (item) => {
    setItinerary((prev) => (prev.find((x) => x.id === item.id) ? prev : [...prev, item]));
  };

  // PUBLIC_INTERFACE
  const removeFromItinerary = (id) => setItinerary((prev) => prev.filter((p) => p.id !== id));

  // PUBLIC_INTERFACE
  const reorderItinerary = (fromIndex, toIndex) => {
    setItinerary((prev) => {
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
      alert("Add at least two places to build a route.");
      return;
    }
    try {
      const route = await getOptimizedRoute(itinerary);
      setRouteGeojson(route);
    } catch (e) {
      console.error(e);
      alert(
        "Failed to compute route. Ensure OpenRouteService API key is set, or fallback will draw a straight line."
      );
    }
  };

  // Auth route rendering
  const onAuthSuccess = (sess) => {
    setSession(sess);
    go("planner");
  };

  const onLogout = () => {
    logout();
    setSession(null);
    go("login");
  };

  // Redirect unauthenticated users away from planner
  useEffect(() => {
    if (!session && route === "planner") {
      go("login");
    }
  }, [route, session]);

  if (!session && route === "signup") {
    return <Signup onSuccess={onAuthSuccess} goToLogin={() => go("login")} />;
  }

  if (!session) {
    // default to login
    return <Login onSuccess={onAuthSuccess} goToSignup={() => go("signup")} />;
  }

  // Planner UI
  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="dot" />
            OceanTrip Planner
            <span className="badge" title="Free & Open APIs">
              OSS
            </span>
          </div>
          <div className="searchbar">
            <input
              className="input"
              placeholder="Search city or place (e.g., Paris, Eiffel Tower)"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocate()}
              aria-label="Search place"
            />
            <button className="btn" onClick={handleLocate} disabled={searching}>
              {searching ? "Searching…" : "Locate"}
            </button>
          </div>
          <div className="row">
            <a
              className="btn btn-secondary"
              href="https://operations.osmfoundation.org/policies/nominatim/"
              target="_blank"
              rel="noreferrer"
              title="Nominatim Policy"
            >
              API Policy
            </a>
            <button className="btn btn-danger" onClick={onLogout} title="Sign out">
              Sign out ({session?.username || session?.email})
            </button>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="panel">
          <div className="panel-header">Attraction Search</div>
          <div className="panel-body">
            <SearchPanel center={center} onResults={setPoi} onAdd={addToItinerary} />
            <div className="sep" />
            <div className="muted" style={{ fontSize: 12 }}>
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
            onAdd={(item) => {
              if (item) {
                setItinerary((prev) => (prev.find((x) => x.id === item.id) ? prev : [...prev, item]));
                setSelectedItemId(item.id);
              }
            }}
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
            <div className="muted" style={{ fontSize: 12 }}>
              Routing via OpenRouteService (free tier requires API key). Set REACT_APP_ORS_API_KEY in your environment
              for road routing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
