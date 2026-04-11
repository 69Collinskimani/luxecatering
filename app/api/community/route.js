import { supabaseAdmin } from "@/lib/supabase-admin";

// ─── GET: chefs | blogs | recipe-of-day | community-recipes ──────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    // ── Chefs ────────────────────────────────────────────────────────────────
    if (type === "chefs") {
      const { data, error } = await supabaseAdmin
        .from("chefs")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return Response.json(data);
    }

    // ── Blog Posts ────────────────────────────────────────────────────────────
    if (type === "blogs") {
      const category = searchParams.get("category");
      let query = supabaseAdmin
        .from("blog_posts")
        .select("id,title,slug,excerpt,cover_image,author,category,tags,views,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (category && category !== "all") query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return Response.json(data);
    }

    // ── Single Blog Post ──────────────────────────────────────────────────────
    if (type === "blog") {
      const slug = searchParams.get("slug");
      const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      // Increment views
      await supabaseAdmin.from("blog_posts").update({ views: (data.views || 0) + 1 }).eq("id", data.id);
      return Response.json(data);
    }

    // ── Recipe of the Day ─────────────────────────────────────────────────────
    if (type === "recipe-of-day") {
      const today = new Date().toISOString().slice(0, 10);

      // Check if today's recipe exists
      const { data: existing } = await supabaseAdmin
        .from("recipe_of_day")
        .select("*")
        .eq("date", today)
        .single();

      if (existing) return Response.json(existing);

      // Fallback local Kenyan recipe (no AI needed)
      const KENYAN_FALLBACKS = [
        { name:"Pilau", emoji:"🍛", cuisine:"Kenyan-Swahili", time:"1 hr", servings:"6 servings", difficulty:"Medium", isVegetarian:false, isVegan:false, tags:["rice","spiced"], ingredients:["2 cups basmati rice","500g beef","2 onions","1 tsp cumin","1 tsp cardamom","1 tsp cinnamon"], instructions:"Fry onions until golden. Add spices and beef. Add soaked rice and water. Cook covered 25 minutes." },
        { name:"Kuku Paka", emoji:"🍗", cuisine:"Kenyan-Coastal", time:"1 hr", servings:"4 servings", difficulty:"Medium", isVegetarian:false, isVegan:false, tags:["coconut","chicken"], ingredients:["1 whole chicken","400ml coconut milk","2 tomatoes","1 onion","1 tsp turmeric"], instructions:"Grill chicken until charred. Fry onion and spices. Add coconut milk and chicken. Simmer 20 minutes." },
        { name:"Nyama Choma", emoji:"🥩", cuisine:"Kenyan", time:"1.5 hrs", servings:"6 servings", difficulty:"Medium", isVegetarian:false, isVegan:false, tags:["grilled","bbq"], ingredients:["1.5kg goat ribs","2 tbsp salt","1 tsp black pepper","1 tsp garlic powder"], instructions:"Season meat and grill over charcoal turning every 15 minutes for 1.5 hours. Serve with kachumbari." },
        { name:"Githeri", emoji:"🫘", cuisine:"Kenyan", time:"1.5 hrs", servings:"6 servings", difficulty:"Easy", isVegetarian:true, isVegan:true, tags:["beans","maize"], ingredients:["2 cups dry maize","1 cup beans","2 tomatoes","1 onion","1 tsp curry powder"], instructions:"Soak maize and beans overnight. Boil until tender. Fry onions and tomatoes. Add maize and beans, simmer 15 minutes." },
        { name:"Chapati", emoji:"🫓", cuisine:"Kenyan-Swahili", time:"45 mins", servings:"8 pieces", difficulty:"Medium", isVegetarian:true, isVegan:true, tags:["bread","flatbread"], ingredients:["3 cups flour","1 cup warm water","3 tbsp oil","1 tsp salt"], instructions:"Mix flour, salt, oil and water into soft dough. Knead 10 minutes, rest 30 minutes. Roll thin, cook on hot pan until golden." },
        { name:"Mandazi", emoji:"🍩", cuisine:"Kenyan-Coastal", time:"45 mins", servings:"20 pieces", difficulty:"Easy", isVegetarian:true, isVegan:false, tags:["snack","fried"], ingredients:["3 cups flour","1/2 cup sugar","1 cup coconut milk","1 tsp cardamom","Oil for frying"], instructions:"Mix ingredients into soft dough. Let rise 30 minutes. Cut into triangles. Deep fry until golden. Serve with chai." },
        { name:"Ugali na Sukuma", emoji:"🌽", cuisine:"Kenyan", time:"30 mins", servings:"4 servings", difficulty:"Easy", isVegetarian:true, isVegan:true, tags:["staple","vegetarian"], ingredients:["2 cups maize flour","4 cups water","1 bunch kale","1 onion","2 tomatoes"], instructions:"Boil water, add maize flour stirring until thick. Fry onion and tomatoes, add kale and cook 5 minutes. Serve together." },
      ];

      // Pick based on day of week so it rotates
      const dayOfWeek = new Date().getDay();
      const recipe    = KENYAN_FALLBACKS[dayOfWeek % KENYAN_FALLBACKS.length];

      // Save to DB
      const { data: saved } = await supabaseAdmin
        .from("recipe_of_day")
        .insert([{ date: today, recipe_name: recipe.name, recipe_data: recipe, source: "local" }])
        .select().single();

      return Response.json(saved || { date: today, recipe_name: recipe.name, recipe_data: recipe });
    }

    // ── Community Recipes ─────────────────────────────────────────────────────
    if (type === "community-recipes") {
      const { data, error } = await supabaseAdmin
        .from("community_recipes")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Response.json(data);
    }

    return Response.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("community GET error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: Submit community recipe or like ────────────────────────────────────
export async function POST(request) {
  try {
    const { type, data } = await request.json();

    // ── Submit Recipe ─────────────────────────────────────────────────────────
    if (type === "submit-recipe") {
      const { error, data: saved } = await supabaseAdmin
        .from("community_recipes")
        .insert([{
          name:         data.name,
          description:  data.description,
          category:     data.category,
          cuisine:      data.cuisine,
          time:         data.time,
          servings:     data.servings,
          difficulty:   data.difficulty,
          ingredients:  data.ingredients,
          instructions: data.instructions,
          tags:         data.tags || [],
          is_vegetarian:data.isVegetarian || false,
          is_vegan:     data.isVegan || false,
          submitted_by: data.submittedBy,
          email:        data.email,
          status:       "pending",
        }])
        .select().single();
      if (error) throw error;

      // Notify admin
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:     "confirmation",
          to_email: process.env.ADMIN_EMAIL,
          name:     "Admin",
          booking_ref: `RECIPE-${saved.id.slice(0,8).toUpperCase()}`,
          event_date:  new Date().toISOString().slice(0, 10),
          package_name:`New Recipe Submitted: ${data.name} by ${data.submittedBy}`,
          guest_count: 0, total_amount: "0.00",
          customer_name:  data.submittedBy,
          customer_email: data.email,
        }),
      }).catch(() => {});

      return Response.json({ success: true, id: saved.id });
    }

    // ── Like Recipe ───────────────────────────────────────────────────────────
    if (type === "like") {
      const ipHash = Buffer.from(data.ip || "anonymous").toString("base64").slice(0, 16);
      const { error } = await supabaseAdmin
        .from("recipe_likes")
        .insert([{ recipe_id: data.recipeId, ip_hash: ipHash }]);
      if (error && error.code === "23505") {
        return Response.json({ error: "Already liked" }, { status: 400 });
      }
      await supabaseAdmin.rpc("increment_likes", { recipe_id: data.recipeId }).catch(() =>
        supabaseAdmin.from("community_recipes")
          .update({ likes: supabaseAdmin.raw("likes + 1") })
          .eq("id", data.recipeId)
      );
      return Response.json({ success: true });
    }

    return Response.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("community POST error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
