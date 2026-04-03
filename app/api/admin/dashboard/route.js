import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // ── All bookings ──────────────────────────────────────────────────────────
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    // ── All invoices ──────────────────────────────────────────────────────────
    const { data: invoices } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    // ── Stats ─────────────────────────────────────────────────────────────────
    const total        = bookings?.length || 0;
    const confirmed    = bookings?.filter(b => b.status === "confirmed").length  || 0;
    const pending      = bookings?.filter(b => b.status === "pending").length    || 0;
    const cancelled    = bookings?.filter(b => b.status === "cancelled").length  || 0;
    const completed    = bookings?.filter(b => b.status === "completed").length  || 0;
    const totalRevenue = invoices?.filter(i => i.status === "paid").reduce((s, i) => s + (i.total_amount || 0), 0) || 0;
    const pending_rev  = invoices?.filter(i => i.status === "unpaid").reduce((s, i) => s + (i.total_amount || 0), 0) || 0;

    // ── Monthly revenue (last 6 months) ───────────────────────────────────────
    const monthlyRevenue = {};
    invoices?.filter(i => i.status === "paid").forEach(i => {
      const month = i.created_at?.slice(0, 7);
      if (month) monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (i.total_amount || 0);
    });

    // ── Package popularity ────────────────────────────────────────────────────
    const packageCount = {};
    bookings?.forEach(b => {
      if (b.package_name) packageCount[b.package_name] = (packageCount[b.package_name] || 0) + 1;
    });

    return Response.json({
      stats: { total, confirmed, pending, cancelled, completed, totalRevenue, pendingRevenue: pending_rev },
      bookings,
      invoices,
      monthlyRevenue,
      packageCount,
    });
  } catch (err) {
    console.error("dashboard error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}