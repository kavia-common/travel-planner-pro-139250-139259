import React from "react";

/**
 * PUBLIC_INTERFACE
 * ItineraryPanel
 * Renders itinerary items and exposes actions for remove, reorder, clear, and optimize.
 */
export default function ItineraryPanel({ items, selectedId, onRemove, onReorder, onClear, onOptimize }) {
  const moveUp = (idx) => idx > 0 && onReorder?.(idx, idx - 1);
  const moveDown = (idx) => idx < items.length - 1 && onReorder?.(idx, idx + 1);

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <button className="btn btn-danger" onClick={() => onClear?.()} disabled={!items?.length}>
          Clear
        </button>
        <button className="btn" onClick={() => onOptimize?.()} disabled={!items || items.length < 2}>
          Optimize / Route
        </button>
      </div>
      <div className="sep" />
      <div className="col" style={{ gap: 6 }}>
        {items?.length ? (
          items.map((p, idx) => (
            <div className="item-row card" key={p.id} style={{ borderColor: selectedId === p.id ? "var(--primary)" : undefined }}>
              <div>
                <strong>{p.name}</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  {p.lat?.toFixed?.(4)}, {p.lon?.toFixed?.(4)}
                </div>
              </div>
              <div className="row">
                <button className="btn btn-secondary" onClick={() => moveUp(idx)} title="Move up">↑</button>
                <button className="btn btn-secondary" onClick={() => moveDown(idx)} title="Move down">↓</button>
                <button className="btn btn-danger" onClick={() => onRemove?.(p.id)} title="Remove">✕</button>
              </div>
            </div>
          ))
        ) : (
          <div className="muted">No items yet. Add places from search or map.</div>
        )}
      </div>
    </div>
  );
}
