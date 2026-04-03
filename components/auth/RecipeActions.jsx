"use client";
import { useState, useEffect } from "react";
import { useAuth }             from "@/context/AuthContext";

export default function RecipeActions({ recipe, onAuthRequired }) {
  const { user, supabase } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [cooked,     setCooked]     = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating,     setRating]     = useState(0);
  const [review,     setReview]     = useState("");
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");

  const recipeId = String(recipe?.id || recipe?.name);

  useEffect(() => {
    if (!user || !recipe) return;
    // Check if bookmarked
    supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("recipe_id", recipeId).single()
      .then(({ data }) => setBookmarked(!!data));
    // Check if cooked
    supabase.from("cooking_history").select("id").eq("user_id", user.id).eq("recipe_id", recipeId).single()
      .then(({ data }) => setCooked(!!data));
  }, [user, recipeId]);

  const requireAuth = () => { if (!user) { onAuthRequired?.(); return false; } return true; };

  const toggleBookmark = async () => {
    if (!requireAuth()) return;
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("recipe_id", recipeId);
      setBookmarked(false);
      setMsg("Removed from bookmarks");
    } else {
      await supabase.from("bookmarks").insert([{
        user_id: user.id, recipe_id: recipeId,
        recipe_name: recipe.name, recipe_data: recipe, source: recipe.source || "local",
      }]);
      setBookmarked(true);
      setMsg("Saved to bookmarks! ❤️");
    }
    setTimeout(() => setMsg(""), 2000);
  };

  const markCooked = async () => {
    if (!requireAuth()) return;
    if (cooked) return;
    await supabase.from("cooking_history").insert([{
      user_id: user.id, recipe_id: recipeId,
      recipe_name: recipe.name, recipe_data: recipe,
    }]);
    setCooked(true);
    setMsg("Added to cooking history! 👨‍🍳");
    setTimeout(() => setMsg(""), 2000);
  };

  const submitReview = async () => {
    if (!requireAuth()) return;
    if (!rating) return;
    setSaving(true);
    await supabase.from("recipe_reviews").upsert([{
      user_id: user.id, recipe_id: recipeId,
      recipe_name: recipe.name, rating, review,
    }], { onConflict: "user_id,recipe_id" });
    setSaving(false);
    setShowReview(false);
    setMsg("Review saved! ⭐");
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div className="mt-4">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={toggleBookmark}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition"
          style={{ background: bookmarked ? "rgba(200,75,49,0.15)" : "transparent", color: bookmarked ? "#C84B31" : "#888", borderColor: bookmarked ? "#C84B31" : "#444" }}>
          {bookmarked ? "❤️ Saved" : "🤍 Save"}
        </button>
        <button onClick={markCooked}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition"
          style={{ background: cooked ? "rgba(45,106,79,0.15)" : "transparent", color: cooked ? "#2D6A4F" : "#888", borderColor: cooked ? "#2D6A4F" : "#444" }}>
          {cooked ? "✅ Cooked" : "👨‍🍳 Mark Cooked"}
        </button>
        <button onClick={() => requireAuth() && setShowReview(!showReview)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 transition">
          ⭐ Rate
        </button>
      </div>

      {/* Toast Message */}
      {msg && (
        <div className="mt-2 text-xs px-3 py-1.5 rounded-full inline-block font-bold"
          style={{ background:"rgba(45,106,79,0.2)", color:"#2D6A4F" }}>{msg}</div>
      )}

      {/* Review Form */}
      {showReview && (
        <div className="mt-3 p-4 rounded-xl border border-gray-700" style={{ background:"#111" }}>
          <p className="text-xs font-bold text-white mb-2">Rate this recipe:</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}
                className="text-2xl transition hover:scale-110"
                style={{ color: n <= rating ? "#F59E0B" : "#333" }}>★</button>
            ))}
          </div>
          <textarea value={review} onChange={e => setReview(e.target.value)}
            rows={2} placeholder="Write a review (optional)..."
            className="w-full rounded-lg px-3 py-2 text-xs border focus:outline-none text-white resize-none mb-2"
            style={{ background:"#1a1a1a", borderColor:"#333" }} />
          <div className="flex gap-2">
            <button onClick={() => setShowReview(false)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-600 text-gray-400 transition">Cancel</button>
            <button onClick={submitReview} disabled={!rating || saving}
              className="text-xs px-4 py-1.5 rounded-full font-bold text-white disabled:opacity-40 transition"
              style={{ background:"#C84B31" }}>
              {saving ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}