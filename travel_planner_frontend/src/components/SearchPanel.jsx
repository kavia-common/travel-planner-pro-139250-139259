import React, { useState } from 'react';
import { fetchAttractionsByRadius } from '../services/opentripmap';

// PUBLIC_INTERFACE
export default function SearchPanel({ center, onResults, onAdd }) {
  const [radius, setRadius] = useState(3000);
  const [kinds, setKinds] = useState('interesting_places');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetchAttractionsByRadius({ lat: center[0], lon: center[1], radius, kinds });
      onResults(res);
    } catch (e) {
      console.error(e);
      const msg = e && e.message ? e.message : 'Unknown error.';
      alert(
        'Failed to fetch attractions.\n\n' +
        msg +
        '\n\nTips:\n- If the message indicates authentication is required, set REACT_APP_OPENTRIPMAP_API_KEY in a .env file and restart.\n' +
        '- You can obtain a free key at https://opentripmap.io/\n- Try a larger radius or a different category.\n- Please wait and retry if rate-limited.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col">
      <div className="row">
        <input className="input" type="number" min={500} max={20000} step={100}
               value={radius} onChange={e => setRadius(Number(e.target.value))}
               aria-label="Search radius (meters)"
               placeholder="Radius (m)" />
        <select className="input" value={kinds} onChange={e => setKinds(e.target.value)} aria-label="Attraction category">
          <option value="interesting_places">Interesting places</option>
          <option value="cultural">Cultural</option>
          <option value="natural">Natural</option>
          <option value="historic">Historic</option>
          <option value="industrial_facilities">Industrial</option>
          <option value="religion">Religion</option>
          <option value="tourist_facilities">Tourist facilities</option>
          <option value="accomodations">Accommodations</option>
          <option value="foods">Food</option>
        </select>
        <button className="btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      <AttractionResults onAdd={onAdd} />
    </div>
  );
}

/** Local stateful list component rendered via global store-free pattern (simple event) */
const subscribers = new Set();
function publishResults(items) { subscribers.forEach((fn) => fn(items)); }

// Intercept onResults prop from parent via monkey patch
// Parent will call onResults; we expose a minimal event to update the list below.
export function setSearchResults(items) { publishResults(items); }

function AttractionResults({ onAdd }) {
  const [items, setItems] = useState([]);
  React.useEffect(() => {
    const fn = (list) => setItems(list);
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }, []);

  return (
    <div className="col" style={{ maxHeight: '60vh', overflow: 'auto' }}>
      {items.length === 0 ? (
        <div className="empty">No attractions listed. Search to discover places around the map center.</div>
      ) : items.map((p) => (
        <div key={p.id} className="item-row card">
          <div className="col">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>{p.name || 'Attraction'}</div>
              {p.rate && <span className="badge">Rate {p.rate}</span>}
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              {p.kinds ? p.kinds.split(',').slice(0,4).join(', ') : 'POI'}
            </div>
          </div>
          <div className="row">
            <button className="btn" onClick={() => onAdd({
              id: p.id,
              name: p.name || 'Attraction',
              lat: p.lat,
              lon: p.lon
            })}>Add</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Wire the event with public API of this module for parent to trigger updates
SearchPanel.defaultProps = {
  onResults: (items) => setSearchResults(items)
};
