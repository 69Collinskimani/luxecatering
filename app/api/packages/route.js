import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("base_price", { ascending: true });

    if (error) throw error;

    const packages = data.map(pkg => ({
      ...pkg,
      features: typeof pkg.features === "string" ? JSON.parse(pkg.features) : pkg.features || [],
      extras:   typeof pkg.extras   === "string" ? JSON.parse(pkg.extras)   : pkg.extras   || [],
    }));

    return Response.json(packages);
  } catch (err) {
    console.error("GET /api/packages error:", err);
    return Response.json([], { status: 500 }); // always return array, never an object
  }
}