"use client";
import { useState, useEffect } from "react";

export function DailyFusion() {
  const [recipe,  setRecipe]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    const today  = new Date().toDateString();
    const cached = localStorage.getItem("daily_fusion");
    const parsed = cached ? JSON.parse(cached) : null;
    if (parsed?.date === today) { setRecipe(parsed.recipe); return; }

    const fetchFusion = async () => {
      setLoading(true);
      try {
        const res  = await fetch("/api/ai-chef", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "daily_fusion", payload: {} }),
        });
        const data = await res.json();
        if (!data.error) {
          setRecipe(data);
          localStorage.setItem("daily_fusion", JSON.stringify({ date: today, recipe: data }));
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchFusion();
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border" style={{ background: "white", borderColor: "#E8E0D8" }}>
      <div className="p-4" style={{ background: "linear-gradient(135deg,#C84B31,#E07B54)" }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs font-bold text-white opacity-80 uppercase tracking-widest">Today's Special</div>
            <h3 className="text-xl font-black text-white" style={{ fontFamily: "Georgia,serif" }}>🇰🇪 Daily Kenyan Fusion</h3>
          </div>
          <div className="text-4xl">{recipe?.emoji || "🍽️"}</div>
        </div>
      </div>
      <div className="p-5">
        {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-4 rounded animate-pulse" style={{ background: "#FFF3E0" }} />)}</div>}
        {recipe && !loading && (
          <>
            <h4 className="text-lg font-black mb-1" style={{ color: "#1A1A1A", fontFamily: "Georgia,serif" }}>{recipe.name}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white mb-3 inline-block" style={{ background: "#2D6A4F" }}>🌍 Kenyan × {recipe.fusionWith}</span>
            <p className="text-sm mb-3" style={{ color: "#444" }}>{recipe.description}</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#C84B31" }}>⏱ {recipe.time}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#C84B31" }}>🍽 {recipe.servings}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#C84B31" }}>📊 {recipe.difficulty}</span>
            </div>
            {recipe.funFact && (
              <div className="rounded-xl p-3 mb-3" style={{ background: "#F0FFF4", borderLeft: "3px solid #2D6A4F" }}>
                <p className="text-xs" style={{ color: "#2D6A4F" }}>💡 <strong>Fun Fact:</strong> {recipe.funFact}</p>
              </div>
            )}
            <button onClick={() => setOpen(!open)} className="text-xs font-bold underline" style={{ color: "#C84B31" }}>
              {open ? "Hide recipe ▲" : "View full recipe ▼"}
            </button>
            {open && (
              <div className="mt-3">
                <h5 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: "#666" }}>Ingredients</h5>
                <ul className="text-xs mb-3 grid grid-cols-2 gap-1">{recipe.ingredients?.map((ing, i) => <li key={i} style={{ color: "#444" }}>• {ing}</li>)}</ul>
                <h5 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: "#666" }}>Instructions</h5>
                <p className="text-xs leading-relaxed" style={{ color: "#444" }}>{recipe.instructions}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}