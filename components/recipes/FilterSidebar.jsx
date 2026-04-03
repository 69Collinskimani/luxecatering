"use client";

export default function FilterSidebar({ filters, setFilters, onClose }) {
  const clearFilters = () => setFilters({ diet: [], mealType: "", prepTime: "", difficulty: "", cuisine: "" });
  const toggleDiet   = d  => setFilters(p => ({ ...p, diet: p.diet.includes(d) ? p.diet.filter(x => x !== d) : [...p.diet, d] }));

  return (
    <div className="w-64 flex-shrink-0 rounded-2xl p-5 shadow-lg border h-fit sticky top-24" style={{ background: "white", borderColor: "#E8E0D8" }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black" style={{ fontFamily: "Georgia,serif", color: "#1A1A1A" }}>Filters</h3>
        <button onClick={clearFilters} className="text-xs font-bold" style={{ color: "#C84B31" }}>Clear All</button>
      </div>

      {/* Difficulty */}
      <div className="mb-4">
        <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: "#666" }}>Difficulty</h4>
        {["Easy", "Medium", "Hard"].map(d => (
          <label key={d} className="flex items-center gap-2 cursor-pointer mb-1">
            <input type="radio" name="difficulty" checked={filters.difficulty === d} onChange={() => setFilters(p => ({ ...p, difficulty: p.difficulty === d ? "" : d }))} className="accent-orange-500" />
            <span className="text-sm">{d}</span>
          </label>
        ))}
      </div>

      {/* Diet */}
      <div className="mb-4">
        <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: "#666" }}>Diet</h4>
        {["Vegetarian", "Vegan", "Gluten-Free", "Halal"].map(d => (
          <label key={d} className="flex items-center gap-2 cursor-pointer mb-1">
            <input type="checkbox" checked={filters.diet.includes(d)} onChange={() => toggleDiet(d)} className="accent-orange-500" />
            <span className="text-sm">{d}</span>
          </label>
        ))}
      </div>

      {/* Prep Time */}
      <div className="mb-4">
        <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: "#666" }}>Prep Time</h4>
        {[["15","Under 15 min"], ["30","Under 30 min"], ["60","Under 1 hour"], ["","Any"]].map(([val, label]) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer mb-1">
            <input type="radio" name="prepTime" checked={filters.prepTime === val} onChange={() => setFilters(p => ({ ...p, prepTime: val }))} className="accent-orange-500" />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>

      <button onClick={onClose} className="w-full py-2 rounded-full text-sm font-bold text-white mt-2" style={{ background: "#C84B31" }}>Apply Filters</button>
    </div>
  );
}