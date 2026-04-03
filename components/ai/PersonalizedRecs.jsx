"use client";
import { useState, useEffect } from "react";

export function PersonalizedRecs({ viewHistory }) {
  const [recs,    setRecs]    = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecs = async () => {
    if (!viewHistory.length) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/ai-chef", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "recommendations", payload: { history: viewHistory.slice(-6) } }),
      });
      const data = await res.json();
      setRecs(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { if (viewHistory.length >= 2) getRecs(); }, [viewHistory]);

  if (!viewHistory.length) return (
    <div className="rounded-2xl p-6 shadow-lg border text-center" style={{ background: "white", borderColor: "#E8E0D8" }}>
      <div className="text-4xl mb-2">👀</div>
      <h3 className="text-xl font-black mb-1" style={{ fontFamily: "Georgia,serif", color: "#2D6A4F" }}>Personalized For You</h3>
      <p className="text-sm" style={{ color: "#999" }}>Browse a few recipes first and we'll suggest ones you'll love!</p>
    </div>
  );

  return (
    <div className="rounded-2xl p-6 shadow-lg border" style={{ background: "white", borderColor: "#E8E0D8" }}>
      <h3 className="text-xl font-black mb-1" style={{ fontFamily: "Georgia,serif", color: "#2D6A4F" }}>⭐ Picked For You</h3>
      <p className="text-sm mb-4" style={{ color: "#666" }}>Based on: {viewHistory.slice(-3).join(", ")}</p>
      {loading && <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#F0FFF4" }} />)}</div>}
      {!loading && recs.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {recs.map((r, i) => (
            <div key={i} className="rounded-xl p-3 border" style={{ background: "#F0FFF4", borderColor: "#C6F6D5" }}>
              <div className="text-2xl mb-1">{r.emoji}</div>
              <h4 className="font-black text-xs mb-1" style={{ color: "#1A1A1A" }}>{r.name}</h4>
              <p className="text-xs" style={{ color: "#666" }}>{r.reason}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#D8F3DC", color: "#2D6A4F" }}>⏱ {r.time}</span>
                {r.isVegetarian && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#D8F3DC", color: "#2D6A4F" }}>🌿</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}