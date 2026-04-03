import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref   = searchParams.get("ref");
    const email = searchParams.get("email");

    if (!ref || !email) {
      return Response.json({ error: "Booking reference and email are required." }, { status: 400 });
    }

    // Find booking
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("booking_ref", ref.trim().toUpperCase())
      .eq("customer_email", email.trim().toLowerCase())
      .single();

    if (bErr || !booking) {
      return Response.json({ error: "No booking found with those details. Please check your reference and email." }, { status: 404 });
    }

    // Find invoice
    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("booking_id", booking.id)
      .single();

    // Find email logs
    const { data: emailLogs } = await supabaseAdmin
      .from("email_logs")
      .select("*")
      .eq("booking_id", booking.id)
      .order("sent_at", { ascending: false });

    return Response.json({ booking, invoice, emailLogs });
  } catch (err) {
    console.error("portal error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}