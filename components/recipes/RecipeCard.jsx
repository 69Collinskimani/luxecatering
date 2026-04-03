"use client";

export default function RecipeCard({ recipe, image, onClick }) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden border cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ background: "white", borderColor: "#E8E0D8" }}
    >
      <div className="relative h-48 overflow-hidden">
        {image || recipe.image ? (
          <img
            src={image || recipe.image}
            alt={recipe.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        ) : null}
        <span
          className="text-6xl w-full h-full items-center justify-center"
          style={{ display: image || recipe.image ? "none" : "flex", background: "#FFF8F0" }}
        >{recipe.emoji}</span>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "rgba(200,75,49,0.75)" }}
        >
          <span className="font-black text-sm px-4 py-2 rounded-full border-2 border-white text-white">View Recipe →</span>
        </div>

        {recipe.category  && <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#C84B31" }}>{recipe.category}</span>}
        {recipe.difficulty && <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "rgba(0,0,0,0.6)" }}>{recipe.difficulty}</span>}
      </div>

      <div className="p-4">
        <h3 className="font-black text-sm mb-2 line-clamp-2" style={{ fontFamily: "Georgia,serif", color: "#1A1A1A" }}>{recipe.name}</h3>
        <div className="flex gap-3 text-xs mb-2" style={{ color: "#888" }}>
          {recipe.time     && <span>⏱ {recipe.time}</span>}
          {recipe.servings && <span>🍽 {recipe.servings}</span>}
          {recipe.cuisine  && <span>🌍 {recipe.cuisine}</span>}
        </div>
        <div className="flex gap-1 flex-wrap">
          {recipe.isVegetarian && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#D8F3DC", color: "#2D6A4F" }}>🌿 Veg</span>}
          {recipe.isVegan      && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#D8F3DC", color: "#2D6A4F" }}>🌱 Vegan</span>}
        </div>
      </div>
    </div>
  );
}