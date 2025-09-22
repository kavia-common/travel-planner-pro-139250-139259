import React from 'react';

// PUBLIC_INTERFACE
export default function ItineraryPanel({ items, selectedId, onRemove, onReorder, onClear, onOptimize }) {
  const moveUp = (idx) => idx > 0 && onReorder(idx, idx - 1);
  const moveDown = (idx) => idx < items.length - 1 && onReorder(idx, idx + 1);

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="badge">Stops: {items.length}</div>
        <div className="row">
          <button className="btn btn-secondary" onClick={onOptimize} disabled={items.length < 2}>Optimize</button>
          <button className="btn" style={{ background: '#ef4444' }} onClick={onClear} disabled={items.length === 0}>Clear</button>
        </div>
      </div>

      <div className="sep" />

      <div className="col" style={{ maxHeight: '60vh', overflow: 'auto' }}>
        {items.length === 0 ? (
          <div className="empty">Add places from the left panel to build your itinerary.</div>
        ) : items.map((p, idx) => (
          <div key={p.id} className="item-row card" style={{ borderColor: selectedId === p.id ? 'rgba(37,99,235,0.5)' : 'rgba(17,24,39,0.06)' }}>
            <div className="col">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="badge">#{idx + 1}</span>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {p.lat.toFixed(4)}, {p.lon.toFixed(4)}
                </div>
              </div>
              <div className="row">
                <button className="btn" onClick={() => moveUp(idx)} disabled={idx === 0} title="Move up">↑</button>
                <button className="btn" onClick={() => moveDown(idx)} disabled={idx === items.length - 1} title="Move down">↓</button>
                <button className="btn" style={{ background: '#ef4444' }} onClick={() => onRemove(p.id)} title="Remove">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
