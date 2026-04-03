import { supabaseAdmin } from "@/lib/supabase-admin";

function toCSV(data, columns) {
  if (!data?.length) return columns.join(",") + "\n";
  const header = columns.join(",");
  const rows   = data.map(row =>
    columns.map(col => {
      const val = row[col] ?? "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type   = searchParams.get("type") || "bookings";
    const format = searchParams.get("format") || "csv";
    const days   = parseInt(searchParams.get("days") || "30");
    const from   = new Date();
    from.setDate(from.getDate() - days);

    let data = [];
    let filename = "";
    let columns  = [];

    if (type === "bookings") {
      const { data: rows } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .gte("created_at", from.toISOString())
        .order("created_at", { ascending: false });
      data     = rows || [];
      filename = `bookings_${new Date().toISOString().slice(0,10)}`;
      columns  = ["booking_ref","customer_name","customer_email","customer_phone","event_date","event_type","guest_count","venue","package_name","base_amount","extras_amount","total_amount","status","payment_status","notes","created_at"];
    }

    if (type === "invoices") {
      const { data: rows } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .gte("created_at", from.toISOString())
        .order("created_at", { ascending: false });
      data     = rows || [];
      filename = `invoices_${new Date().toISOString().slice(0,10)}`;
      columns  = ["invoice_number","customer_name","customer_email","amount","tax_rate","tax_amount","total_amount","status","due_date","paid_at","created_at"];
    }

    if (type === "recipe_views") {
      const { data: rows } = await supabaseAdmin
        .from("recipe_views")
        .select("*")
        .gte("viewed_at", from.toISOString())
        .order("viewed_at", { ascending: false });
      data     = rows || [];
      filename = `recipe_views_${new Date().toISOString().slice(0,10)}`;
      columns  = ["recipe_name","recipe_id","source","cuisine","category","viewed_at"];
    }

    if (type === "searches") {
      const { data: rows } = await supabaseAdmin
        .from("search_queries")
        .select("*")
        .gte("searched_at", from.toISOString())
        .order("searched_at", { ascending: false });
      data     = rows || [];
      filename = `searches_${new Date().toISOString().slice(0,10)}`;
      columns  = ["query","source","results","searched_at"];
    }

    const csv = toCSV(data, columns);

    return new Response(csv, {
      headers: {
        "Content-Type":        "text/csv",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (err) {
    console.error("export error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}