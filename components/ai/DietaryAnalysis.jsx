"use client";
import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DietaryAnalysis() {
  const [meals,    setMeals]    = useState({ Mon:"", Tue:"", Wed:"", Thu:"", Fri:"", Sat:"", Sun:"" });
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const analyze = async () => {
    const filled = Object.values(meals).filter(v => v.trim());
    if (filled.length < 3) { setError("Please enter at least 3 days of meals"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/ai-chef", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dietary_analysis", payload: { meals } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-6 shadow-lg border" style={{ background: "white", borderColor: "#E8E0D8" }}>
      <h3 className="text-xl font-black mb-1" style={{ fontFamily: "Georgia,serif", color: "#2D6A4F" }}>📊 Weekly Dietary Analysis</h3>
      <p className="text-sm mb-4" style={{ color: "#666" }}>Log your meals and get AI health insights</p>
      {!analysis ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {DAYS.map(day => (
              <div key={day}>
                <label className="text-xs font-bold mb-1 block" style={{ color: "#666" }}>{day}</label>
                <input value={meals[day]} onChange={e => setMeals(p => ({ ...p, [day]: e.target.value }))}
                  placeholder="e.g. ugali, chicken..."
                  className="w-full rounded-lg px-3 py-2 text-xs border focus:outline-none"
                  style={{ borderColor: "#E8E0D8", color: "#1A1A1A" }} />
              </div>
            ))}
          </div>
          {error && <p className="text-xs mb-2" style={{ color: "#C84B31" }}>{error}</p>}
          <button onClick={analyze} disabled={loading}
            className="w-full py-2 rounded-full text-sm font-bold text-white disabled:opacity-60"
            style={{ background: "#2D6A4F" }}>
            {loading ? "Analyzing... ⏳" : "Analyze My Diet 🔍"}
          </button>
        </>
      ) : (
        <div>
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-black text-white mb-2"
              style={{ background: analysis.score >= 70 ? "#2D6A4F" : analysis.score >= 50 ? "#C84B31" : "#E53E3E" }}>
              {analysis.score}
            </div>
            <div className="text-xs font-bold" style={{ color: "#666" }}>Health Score / 100</div>
          </div>
          <p className="text-sm mb-4 text-center" style={{ color: "#444" }}>{analysis.summary}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl p-3" style={{ background: "#F0FFF4" }}>
              <h5 className="text-xs font-black mb-2" style={{ color: "#2D6A4F" }}>✅ Strengths</h5>
              {analysis.strengths?.map((s, i) => <p key={i} className="text-xs mb-1" style={{ color: "#444" }}>• {s}</p>)}
            </div>
            <div className="rounded-xl p-3" style={{ background: "#FFF8F0" }}>
              <h5 className="text-xs font-black mb-2" style={{ color: "#C84B31" }}>⚠️ Improve</h5>
              {analysis.improvements?.map((s, i) => <p key={i} className="text-xs mb-1" style={{ color: "#444" }}>• {s}</p>)}
            </div>
          </div>
          <div className="rounded-xl p-3 mb-3" style={{ background: "#FFF3E0" }}>
            <h5 className="text-xs font-black mb-1" style={{ color: "#C84B31" }}>💊 Missing Nutrients</h5>
            <div className="flex gap-1 flex-wrap">
              {analysis.missingNutrients?.map((n, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFD4C2", color: "#C84B31" }}>{n}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-3 mb-3" style={{ background: "#F0FFF4", borderLeft: "3px solid #2D6A4F" }}>
            <h5 className="text-xs font-black mb-1" style={{ color: "#2D6A4F" }}>💡 This Week's Tip</h5>
            <p className="text-xs" style={{ color: "#444" }}>{analysis.weeklyTip}</p>
          </div>
          <div className="mb-4">
            <h5 className="text-xs font-black mb-2" style={{ color: "#666" }}>🍽️ Try These Recipes</h5>
            <div className="flex gap-2">
              {analysis.recommendedRecipes?.map((r, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: "#FFF3E0", color: "#C84B31" }}>{r}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => { setAnalysis(null); setMeals({ Mon:"",Tue:"",Wed:"",Thu:"",Fri:"",Sat:"",Sun:"" }); }}
            className="w-full py-2 rounded-full text-sm font-bold border-2"
            style={{ borderColor: "#2D6A4F", color: "#2D6A4F" }}>
            Start New Analysis ↺
          </button>
        </div>
      )}
    </div>
  );
}