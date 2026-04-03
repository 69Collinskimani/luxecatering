export const UNSPLASH_KEY = "r9jIF_RSWQzIpLlDeJIa9EAkYbOf8TMY3xy3NS12B1w";
export const YOUTUBE_KEY  = "AIzaSyBo2EJxjeI3ztYl25fKBbNfzvql1DFfn50";
export const imageCache   = {};
export const videoCache   = {};

export async function fetchUnsplashImage(query) {
  if (imageCache[query]) return imageCache[query];
  try {
    const res  = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " food")}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } });
    const data = await res.json();
    const url  = data.results?.[0]?.urls?.regular || null;
    if (url) imageCache[query] = url;
    return url;
  } catch { return null; }
}

export function mapSpoonacularRecipe(r, category) {
  const isKenyan = category === "🇰🇪 Kenyan";
  return {
    id: r.id, name: r.title,
    category: isKenyan ? "🇰🇪 Kenyan" : category || "All",
    cuisine:  r.cuisines?.[0] || "International",
    time:     r.readyInMinutes ? `${r.readyInMinutes} mins` : "—",
    servings: r.servings ? `${r.servings} servings` : "—",
    emoji: "🍽️", image: r.image,
    difficulty: r.readyInMinutes < 20 ? "Easy" : r.readyInMinutes < 45 ? "Medium" : "Hard",
    isVegetarian: r.vegetarian, isVegan: r.vegan,
    tags: r.dishTypes?.slice(0, 3) || [],
    ingredients: r.extendedIngredients?.map(i => i.original) || [],
    instructions: r.summary?.replace(/<[^>]+>/g, "").slice(0, 300) + "..." || "",
    sourceUrl: r.sourceUrl,
  };
}

export function mapMealDBRecipe(m, category) {
  return {
    id: m.idMeal, name: m.strMeal,
    category: category === "🇰🇪 Kenyan" ? "🇰🇪 Kenyan" : m.strCategory || category || "All",
    cuisine:  m.strArea || "International",
    time: "45 mins", servings: "4 servings",
    emoji: "🍽️", image: m.strMealThumb,
    difficulty: "Medium",
    isVegetarian: m.strCategory === "Vegetarian", isVegan: false,
    tags: m.strTags?.split(",").slice(0, 3).map(t => t.trim()) || [],
    ingredients: Array.from({ length: 20 }, (_, i) => {
      const ing = m[`strIngredient${i + 1}`];
      const ms  = m[`strMeasure${i + 1}`];
      return ing?.trim() ? `${ms?.trim() || ""} ${ing.trim()}`.trim() : null;
    }).filter(Boolean),
    instructions: m.strInstructions?.slice(0, 400) + "..." || "",
    sourceUrl: m.strSource || m.strYoutube,
  };
}