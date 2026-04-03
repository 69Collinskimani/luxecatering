import { supabaseAdmin } from "@/lib/supabase-admin";

// ─── POST: Track a recipe view or search ─────────────────────────────────────
export async function POST(request) {
  try {
    const { type, data } = await request.json();

    if (type === "recipe_view") {
      await supabaseAdmin.from("recipe_views").insert([{
        recipe_name: data.name,
        recipe_id:   data.id?.toString(),
        source:      data.source || "local",
        cuisine:     data.cuisine,
        category:    data.category,
      }]);
    }

    if (type === "search") {
      await supabaseAdmin.from("search_queries").insert([{
        query:   data.query,
        source:  data.source || "spoonacular",
        results: data.results || 0,
      }]);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("analytics error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─── GET: Fetch analytics data ────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromStr = from.toISOString();

    // ── Recipe views ──────────────────────────────────────────────────────────
    const { data: views } = await supabaseAdmin
      .from("recipe_views")
      .select("*")
      .gte("viewed_at", fromStr)
      .order("viewed_at", { ascending: false });

    // ── Search queries ────────────────────────────────────────────────────────
    const { data: searches } = await supabaseAdmin
      .from("search_queries")
      .select("*")
      .gte("searched_at", fromStr)
      .order("searched_at", { ascending: false });

    // ── Bookings ──────────────────────────────────────────────────────────────
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .gte("created_at", fromStr)
      .order("created_at", { ascending: false });

    // ── Invoices (revenue) ────────────────────────────────────────────────────
    const { data: invoices } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .gte("created_at", fromStr);

    // ── Top recipes ───────────────────────────────────────────────────────────
    const recipeCount = {};
    views?.forEach(v => {
      recipeCount[v.recipe_name] = (recipeCount[v.recipe_name] || 0) + 1;
    });
    const topRecipes = Object.entries(recipeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // ── Top searches ──────────────────────────────────────────────────────────
    const searchCount = {};
    searches?.forEach(s => {
      if (s.query?.trim()) searchCount[s.query.trim().toLowerCase()] = (searchCount[s.query.trim().toLowerCase()] || 0) + 1;
    });
    const topSearches = Object.entries(searchCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // ── Top cuisines ──────────────────────────────────────────────────────────
    const cuisineCount = {};
    views?.forEach(v => {
      if (v.cuisine) cuisineCount[v.cuisine] = (cuisineCount[v.cuisine] || 0) + 1;
    });
    const topCuisines = Object.entries(cuisineCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cuisine, count]) => ({ cuisine, count }));

    // ── Daily bookings trend (last 14 days) ───────────────────────────────────
    const dailyBookings = {};
    bookings?.forEach(b => {
      const day = b.created_at?.slice(0, 10);
      if (day) dailyBookings[day] = (dailyBookings[day] || 0) + 1;
    });

    // ── Monthly revenue ───────────────────────────────────────────────────────
    const monthlyRevenue = {};
    invoices?.filter(i => i.status === "paid").forEach(i => {
      const month = i.created_at?.slice(0, 7);
      if (month) monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (i.total_amount || 0);
    });

    // ── Source breakdown ──────────────────────────────────────────────────────
    const sourceCount = { spoonacular:0, mealdb:0, local:0, ai:0 };
    views?.forEach(v => { if (v.source && sourceCount[v.source] !== undefined) sourceCount[v.source]++; });

    return Response.json({
      summary: {
        totalViews:    views?.length    || 0,
        totalSearches: searches?.length || 0,
        totalBookings: bookings?.length || 0,
        totalRevenue:  invoices?.filter(i => i.status === "paid").reduce((s, i) => s + (i.total_amount || 0), 0) || 0,
      },
      topRecipes,
      topSearches,
      topCuisines,
      dailyBookings,
      monthlyRevenue,
      sourceCount,
      recentViews:   views?.slice(0, 20)    || [],
      recentSearches:searches?.slice(0, 20) || [],
    });
  } catch (err) {
    console.error("analytics GET error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}