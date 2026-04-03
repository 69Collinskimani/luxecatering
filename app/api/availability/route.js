import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end   = searchParams.get("end");

    let query = supabaseAdmin.from("availability").select("*");
    if (start) query = query.gte("date", start);
    if (end)   query = query.lte("date", end);

    const { data, error } = await query.order("date");
    if (error) throw error;

    // Also get booked dates from bookings table
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("event_date, status")
      .gte("event_date", start || "2024-01-01")
      .lte("event_date", end || "2030-12-31")
      .in("status", ["confirmed", "pending"]);

    // Mark booked dates
    const bookedDates = new Set(bookings?.map(b => b.event_date) || []);
    const result = data.map(d => ({
      ...d,
      status: bookedDates.has(d.date) ? "booked" : d.status,
    }));

    return Response.json(result);
  } catch (err) {
    console.error("availability error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { date, status, note } = await request.json();

    const { data, error } = await supabaseAdmin
      .from("availability")
      .upsert({ date, status, note }, { onConflict: "date" })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}