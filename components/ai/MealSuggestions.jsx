"use client";
import { useState } from "react";

export default function MealSuggestions() {
  const [ingredients, setIngredients] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const getSuggestions = async () => {
    if (!ingredients.trim()) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/ai-chef", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "meal_suggestion", payload: { ingredients } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-6 shadow-lg border" style={{ background: "white", borderColor: "#E8E0D8" }}>
      <h3 className="text-xl font-black mb-1" style={{ fontFamily: "Georgia,serif", color: "#C84B31" }}>🥘 What Can I Cook?</h3>
      <p className="text-sm mb-4" style={{ color: "#666" }}>Enter ingredients you have and get instant meal ideas</p>
      <div className="flex gap-2 mb-4">
        <input value={ingredients} onChange={e => setIngredients(e.target.value)} onKeyDown={e => e.key === "Enter" && getSuggestions()}
          placeholder="e.g. chicken, tomatoes, rice, onion..."
          className="flex-1 rounded-full px-4 py-2 text-sm border-2 focus:outline-none"
          style={{ borderColor: "#C84B31", color: "#1A1A1A" }} />
        <button onClick={getSuggestions} disabled={loading} className="px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "#C84B31" }}>{loading ? "⏳" : "Suggest ✨"}</button>
      </div>
      {error && <p className="text-xs mb-3" style={{ color: "#C84B31" }}>{error}</p>}
      {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#FFF3E0" }} />)}</div>}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-xl p-4 border" style={{ background: "#FFF8F0", borderColor: "#FFD4C2" }}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-black text-sm" style={{ color: "#1A1A1A" }}>{s.name}</h4>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: "#E8E0D8" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.matchScore}%`, background: s.matchScore > 70 ? "#2D6A4F" : "#C84B31" }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: s.matchScore > 70 ? "#2D6A4F" : "#C84B31" }}>{s.matchScore}%</span>
                </div>
              </div>
              <p className="text-xs mb-2" style={{ color: "#666" }}>{s.description}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#C84B31" }}>⏱ {s.time}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#C84B31" }}>📊 {s.difficulty}</span>
                {s.missingIngredients?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF0F0", color: "#E53E3E" }}>
                    + {s.missingIngredients.join(", ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}