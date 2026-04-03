"use client";
import { useState, useEffect, useCallback } from "react";
import { CATEGORIES, KENYAN_RECIPES, COMBINED_RECIPES } from "@/data/recipes";
import { fetchUnsplashImage, mapSpoonacularRecipe, mapMealDBRecipe } from "./RecipeUtils";
import RecipeCard    from "./RecipeCard";
import RecipeModal   from "./RecipeModal";
import FilterSidebar from "./FilterSidebar";

const PER_PAGE = 12;

export default function RecipeSection({ onRecipeView }) {
  const [recipes,      setRecipes]      = useState([]);
  const [search,       setSearch]       = useState("");
  const [cat,          setCat]          = useState("All");
  const [selected,     setSelected]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [source,       setSource]       = useState("spoonacular");
  const [aiPrompt,     setAiPrompt]     = useState("");
  const [recipeImages, setRecipeImages] = useState({});
  const [filters,      setFilters]      = useState({ diet:[], mealType:"", prepTime:"", difficulty:"", cuisine:"" });
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [page,         setPage]         = useState(1);

  const activeFilterCount = [filters.diet.length>0, filters.mealType, filters.prepTime, filters.difficulty, filters.cuisine].filter(Boolean).length;

  const applyFilters = rs => rs.filter(r => {
    if (filters.difficulty && r.difficulty !== filters.difficulty) return false;
    if (filters.diet.includes("Vegetarian") && !r.isVegetarian) return false;
    if (filters.diet.includes("Vegan") && !r.isVegan) return false;
    if (filters.prepTime === "15" && parseInt(r.time) > 15) return false;
    if (filters.prepTime === "30" && parseInt(r.time) > 30) return false;
    if (filters.prepTime === "60" && parseInt(r.time) > 60) return false;
    return true;
  });

  const displayedRecipes = applyFilters(recipes).slice(0, page * PER_PAGE);

  // ── Unsplash images ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!recipes.length) return;
    recipes.forEach(async r => {
      if (recipeImages[r.id]) return;
      const q   = r.category === "🇰🇪 Kenyan" ? `${r.name} kenyan food` : `${r.name} dish`;
      const url = await fetchUnsplashImage(q);
      if (url) setRecipeImages(prev => ({ ...prev, [r.id]: url }));
    });
  }, [recipes]);

  // ── Analytics tracking ────────────────────────────────────────────────────
  const trackView = useCallback((recipe) => {
    fetch("/api/analytics", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "recipe_view", data: {
        name: recipe.name, id: recipe.id?.toString(),
        source, cuisine: recipe.cuisine, category: recipe.category,
      }}),
    }).catch(() => {});
  }, [source]);

  const trackSearch = useCallback((query) => {
    if (!query?.trim()) return;
    fetch("/api/analytics", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "search", data: { query, source, results: 0 } }),
    }).catch(() => {});
  }, [source]);

  // ── Local filter ──────────────────────────────────────────────────────────
  const filterLocal = useCallback((q, c) => {
    let r = c === "🇰🇪 Kenyan" ? KENYAN_RECIPES : c && c !== "All" ? COMBINED_RECIPES.filter(x => x.category === c) : COMBINED_RECIPES;
    if (q) r = r.filter(x =>
      x.name.toLowerCase().includes(q.toLowerCase()) ||
      x.cuisine.toLowerCase().includes(q.toLowerCase()) ||
      x.tags.some(t => t.toLowerCase().includes(q.toLowerCase())) ||
      x.ingredients.some(i => i.toLowerCase().includes(q.toLowerCase()))
    );
    setRecipes(r);
  }, []);

  // ── TheMealDB ─────────────────────────────────────────────────────────────
  const fetchMealDB = useCallback(async (q, c) => {
    setLoading(true);
    try {
      let meals = [];
      const isKenyan = c === "🇰🇪 Kenyan";
      if (isKenyan) {
        const data = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Kenyan").then(r => r.json());
        const list = (data.meals||[]).slice(0,9);
        const det  = await Promise.all(list.map(m => fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`).then(r=>r.json()).then(r=>r.meals?.[0])));
        meals = det.filter(Boolean);
      } else if (q) {
        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`).then(r=>r.json());
        meals = (data.meals||[]).slice(0,9);
      } else if (c && c !== "All") {
        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${c}`).then(r=>r.json());
        const list = (data.meals||[]).slice(0,9);
        const det  = await Promise.all(list.map(m => fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`).then(r=>r.json()).then(r=>r.meals?.[0])));
        meals = det.filter(Boolean);
      } else {
        const picks = ["chicken","beef","pasta","fish","vegetable"];
        const pick  = picks[Math.floor(Math.random()*picks.length)];
        const data  = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${pick}`).then(r=>r.json());
        meals = (data.meals||[]).slice(0,9);
      }
      if (!meals.length) { filterLocal(q,c); setLoading(false); return; }
      setError("Spoonacular quota reached — showing TheMealDB results 🍽️");
      setRecipes(meals.map(m => mapMealDBRecipe(m, c)));
    } catch { filterLocal(q,c); }
    setLoading(false);
  }, [filterLocal]);

  // ── Spoonacular ───────────────────────────────────────────────────────────
  const fetchSpoonacular = useCallback(async (q, c) => {
    setLoading(true); setError("");
    try {
      const isKenyan = c === "🇰🇪 Kenyan";
      const params   = new URLSearchParams({ number:9, addRecipeInformation:true });
      if (isKenyan)          { params.set("query", q||"kenyan african ugali pilau"); params.set("cuisine","african"); }
      else if (q)            { params.set("query", q); }
      else if (c && c!=="All") {
        const tm={Beef:"main course",Chicken:"main course",Vegetarian:"main course",Seafood:"main course",Dessert:"dessert",Pasta:"main course",Breakfast:"breakfast"};
        const cm={Beef:"american",Chicken:"asian",Seafood:"mediterranean",Pasta:"italian"};
        if(tm[c])params.set("type",tm[c]); if(cm[c])params.set("cuisine",cm[c]); params.set("query",c.toLowerCase());
      } else { params.set("sort","popularity"); }
      const res  = await fetch(`/api/spoonacular?${params}`);
      const data = await res.json();
      if (!res.ok||data.code===402||data.status==="failure") { await fetchMealDB(q,c); return; }
      if (!data.results?.length) { await fetchMealDB(q,c); return; }
      setRecipes(data.results.map(r => mapSpoonacularRecipe(r, c)));
    } catch { await fetchMealDB(q,c); }
    setLoading(false);
  }, [fetchMealDB]);

  // ── Kenyan ────────────────────────────────────────────────────────────────
  const fetchKenyan = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Kenyan").then(r=>r.json());
      const list = (data.meals||[]).slice(0,6);
      if (list.length) {
        const det  = await Promise.all(list.map(m => fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`).then(r=>r.json()).then(r=>r.meals?.[0])));
        const live = det.filter(Boolean).map(m => mapMealDBRecipe(m,"🇰🇪 Kenyan"));
        setRecipes([...live, ...KENYAN_RECIPES.slice(0, 9-live.length)]);
      } else { setRecipes(KENYAN_RECIPES); }
    } catch { setRecipes(KENYAN_RECIPES); }
    setLoading(false);
  }, []);

  // ── Claude AI ─────────────────────────────────────────────────────────────
  const fetchAI = useCallback(async (prompt, c) => {
    setLoading(true); setError("");
    try {
      const isKenyan = c === "🇰🇪 Kenyan";
      const res = await fetch("/api/ai-recipes", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          prompt: isKenyan?(prompt||"authentic Kenyan dishes like ugali pilau nyama choma kuku paka mandazi"):prompt,
          category: isKenyan?"Kenyan":c,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRecipes(Array.isArray(data)?data:[]);
    } catch(e) { setError(`AI: ${e.message}`); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSpoonacular("","All"); }, [fetchSpoonacular]);

  const handleSearch = () => {
    setPage(1);
    if (search) trackSearch(search);
    if (source==="spoonacular") fetchSpoonacular(search,cat);
    else if (source==="ai")     fetchAI(aiPrompt||search,cat);
    else                        filterLocal(search,cat);
  };

  const handleCat = c => {
    setCat(c); setSearch(""); setAiPrompt(""); setPage(1);
    if (c==="🇰🇪 Kenyan")       { fetchKenyan(); return; }
    if (source==="spoonacular")  fetchSpoonacular("",c);
    else if (source==="ai")      fetchAI("",c);
    else                         filterLocal("",c);
  };

  const switchSource = s => {
    setSource(s); setSearch(""); setAiPrompt(""); setCat("All"); setPage(1);
    if (s==="spoonacular") fetchSpoonacular("","All");
    else if (s==="ai")     fetchAI("","All");
    else                   filterLocal("","All");
  };

  return (
    <section id="recipes" className="py-24 px-4" style={{ background:"#f7f7f7" }}>
      {selected && <RecipeModal recipe={selected} unsplashImage={recipeImages[selected.id]} onClose={() => setSelected(null)} />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:"#4fc831" }}> Recipe Platform</div>
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily:"Georgia,serif", color:"#1A1A1A" }}>
            Browse <span style={{ color:"#C84B31" }}>Real Recipes</span>
          </h2>
          <p className="mb-6" style={{ color:"#666" }}>Powered by Spoonacular · TheMealDB · Claude AI · YouTube</p>

          {/* Source Switcher */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {[["spoonacular"," Spoonacular"],["ai"," AI Generated"],["local"," Local DB"]].map(([s,l]) => (
              <button key={s} onClick={() => switchSource(s)} className="px-5 py-2 rounded-full text-sm font-bold transition border-2"
                style={{ background:source===s?"#C84B31":"white", color:source===s?"white":"#C84B31", borderColor:"#C84B31" }}>{l}</button>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4 flex-wrap">
            {source==="ai"
              ? <input value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  placeholder="Describe recipes (e.g. spicy Kenyan street food...)"
                  className="rounded-full px-5 py-3 text-sm w-96 focus:outline-none shadow-md border-2"
                  style={{ borderColor:"#C84B31", background:"white", color:"#1A1A1A" }} />
              : <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  placeholder="Search recipes (e.g. ugali, pasta, chicken...)"
                  className="rounded-full px-5 py-3 text-sm w-96 focus:outline-none shadow-md border-2"
                  style={{ borderColor:"#C84B31", background:"white", color:"#1A1A1A" }} />}
            <button onClick={handleSearch} className="px-8 py-3 rounded-full text-sm font-bold text-white shadow-md" style={{ background:"#C84B31" }}>
              {source==="ai"?"Generate ✨":"Search "}
            </button>
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="relative px-5 py-3 rounded-full text-sm font-bold border-2 transition"
              style={{ borderColor:"#2D6A4F", background:filterOpen?"#2D6A4F":"white", color:filterOpen?"white":"#2D6A4F" }}>
               Filters
              {activeFilterCount>0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-black" style={{ background:"#C84B31" }}>{activeFilterCount}</span>}
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => handleCat(c)} className="px-4 py-1.5 rounded-full text-xs font-bold transition border"
                style={{ background:cat===c?"#2D6A4F":"white", color:cat===c?"white":"#2D6A4F", borderColor:"#2D6A4F" }}>{c}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {filterOpen && <FilterSidebar filters={filters} setFilters={setFilters} onClose={() => setFilterOpen(false)} />}

          <div className="flex-1">
            {/* Skeleton */}
            {loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length:6}).map((_,i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background:"white" }}>
                    <div className="h-44" style={{ background:"#E8E0D8" }} />
                    <div className="p-4 space-y-2">
                      <div className="h-4 rounded" style={{ background:"#E8E0D8" }} />
                      <div className="h-3 rounded w-2/3" style={{ background:"#E8E0D8" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <div className="text-center py-4 text-sm rounded-xl px-4 mb-6 font-semibold" style={{ background:"#FFF3E0", color:"#C84B31" }}>{error}</div>}

            {!loading && (
              <>
                {!displayedRecipes.length && <div className="text-center py-12" style={{ color:"#999" }}>No recipes found. Try a different search.</div>}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedRecipes.map((r,i) => (
                    <RecipeCard key={r.id||i} recipe={r} image={recipeImages[r.id]}
                      onClick={() => {
                        setSelected(r);
                        onRecipeView?.(r.name);
                        trackView(r);
                      }} />
                  ))}
                </div>

                {applyFilters(recipes).length > page*PER_PAGE && (
                  <div className="text-center mt-10">
                    <button onClick={() => setPage(p=>p+1)}
                      className="px-8 py-3 rounded-full font-bold text-sm border-2 transition"
                      style={{ borderColor:"#C84B31", color:"#C84B31" }}
                      onMouseEnter={e=>{e.target.style.background="#C84B31";e.target.style.color="white";}}
                      onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#C84B31";}}>
                      Load More Recipes ↓
                    </button>
                  </div>
                )}
                <div className="text-center mt-4 text-xs" style={{ color:"#aaa" }}>
                  Showing {displayedRecipes.length} of {applyFilters(recipes).length} · {source==="spoonacular"?" Spoonacular":source==="ai"?"🤖 Claude AI":"📦 Local DB"}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}