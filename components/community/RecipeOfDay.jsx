"use client";
import { useState, useEffect } from "react";

export default function RecipeOfDay() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(false);
  const [imgUrl,  setImgUrl]  = useState(null);

  useEffect(() => {
    fetch("/api/community?type=recipe-of-day")
      .then(r => r.json())
      .then(async d => {
        setData(d);
        // Fetch Unsplash image
        const name = d?.recipe_name || d?.recipe_data?.name || "";
        if (name) {
          const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name + " kenyan food")}&per_page=1&orientation=landscape`,
            { headers: { Authorization: `Client-ID r9jIF_RSWQzIpLlDeJIa9EAkYbOf8TMY3xy3NS12B1w` } }
          );
          const img = await res.json();
          setImgUrl(img.results?.[0]?.urls?.regular || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const recipe = data?.recipe_data;

  return (
    <section className="py-16 px-4" style={{ background:"#0d0d0d" }}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl overflow-hidden border" style={{ borderColor:"#C84B31", background:"#1a1a1a" }}>
          <div className="grid md:grid-cols-2">

            {/* Image Side */}
            <div className="relative h-64 md:h-auto min-h-64 overflow-hidden">
              {loading ? (
                <div className="w-full h-full animate-pulse" style={{ background:"#333" }} />
              ) : imgUrl ? (
                <img src={imgUrl} alt={recipe?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl" style={{ background:"linear-gradient(135deg,#1a0a00,#2a1200)" }}>
                  {recipe?.emoji || "🍽️"}
                </div>
              )}
              <div className="absolute inset-0" style={{ background:"linear-gradient(to right, transparent 60%, #1a1a1a)" }} />
              {/* Date Badge */}
              <div className="absolute top-4 left-4 rounded-2xl p-3 text-center" style={{ background:"rgba(200,75,49,0.95)" }}>
                <div className="text-xs text-white font-bold uppercase">{new Date().toLocaleDateString("en",{month:"short"})}</div>
                <div className="text-2xl font-black text-white leading-none">{new Date().getDate()}</div>
                <div className="text-xs text-white opacity-80">{new Date().getFullYear()}</div>
              </div>
            </div>

            {/* Content Side */}
            <div className="p-8 flex flex-col justify-center">
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color:"#C84B31" }}>
                ⭐ Recipe of the Day
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[80,60,100,40].map(w => <div key={w} className="h-4 rounded animate-pulse" style={{ background:"#333", width:`${w}%` }} />)}
                </div>
              ) : recipe ? (
                <>
                  <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily:"Georgia,serif" }}>{recipe.name}</h2>
                  <div className="flex gap-3 mb-4 flex-wrap">
                    {recipe.cuisine && <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background:"#2D6A4F" }}>🌍 {recipe.cuisine}</span>}
                    {recipe.time    && <span className="text-xs px-2 py-0.5 rounded-full text-gray-300" style={{ background:"#333" }}>⏱ {recipe.time}</span>}
                    {recipe.difficulty && <span className="text-xs px-2 py-0.5 rounded-full text-gray-300" style={{ background:"#333" }}>📊 {recipe.difficulty}</span>}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {recipe.instructions?.slice(0, 180)}...
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setOpen(true)}
                      className="px-6 py-2.5 rounded-full font-black text-white text-sm transition hover:opacity-90"
                      style={{ background:"#C84B31" }}>View Recipe →</button>
                    <button onClick={() => window.open(`https://wa.me/?text=Today's recipe: ${recipe.name} 🍽️ Check it out on LuxeCatering!`)}
                      className="px-6 py-2.5 rounded-full font-black text-sm border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 transition">
                      💬 Share
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">No recipe of the day available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Modal */}
      {open && recipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4" onClick={() => setOpen(false)}>
          <div className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-yellow-700 p-6"
            style={{ background:"#FAF7F2", color:"#1A1A1A" }} onClick={e => e.stopPropagation()}>
            {imgUrl && <img src={imgUrl} alt={recipe.name} className="w-full h-48 object-cover rounded-xl mb-4" />}
            <button onClick={() => setOpen(false)} className="float-right text-gray-500 hover:text-gray-900 text-xl">✕</button>
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily:"Georgia,serif", color:"#C84B31" }}>{recipe.name}</h2>
            <div className="flex gap-2 flex-wrap mb-4">
              {recipe.cuisine    && <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background:"#2D6A4F" }}>{recipe.cuisine}</span>}
              {recipe.time       && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"#FFF3E0", color:"#C84B31" }}>⏱ {recipe.time}</span>}
              {recipe.servings   && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"#FFF3E0", color:"#C84B31" }}>🍽 {recipe.servings}</span>}
              {recipe.difficulty && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"#FFF3E0", color:"#C84B31" }}>📊 {recipe.difficulty}</span>}
            </div>
            {recipe.ingredients?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-black text-sm mb-2" style={{ color:"#2D6A4F" }}>🛒 Ingredients</h4>
                <div className="grid grid-cols-2 gap-1">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span style={{ color:"#C84B31" }}>•</span>{ing}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {recipe.instructions && (
              <div>
                <h4 className="font-black text-sm mb-2" style={{ color:"#2D6A4F" }}>👨‍🍳 Instructions</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{recipe.instructions}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}