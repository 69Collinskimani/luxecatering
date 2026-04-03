import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref   = searchParams.get("ref");
    const email = searchParams.get("email");

    if (!ref || !email) {
      return Response.json({ error: "Booking ref and email required" }, { status: 400 });
    }

    // Find booking
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("booking_ref", ref)
      .eq("customer_email", email)
      .single();

    if (bErr || !booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Find invoice
    const { data: invoice, error: iErr } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("booking_id", booking.id)
      .single();

    if (iErr || !invoice) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    return Response.json({ booking, invoice });
  } catch (err) {
    console.error("invoice fetch error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { invoice_id, status } = await request.json();

    const { data, error } = await supabaseAdmin
      .from("invoices")
      .update({
        status,
        paid_at: status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", invoice_id)
      .select()
      .single();

    if (error) throw error;

    // Also update booking payment status
    await supabaseAdmin
      .from("bookings")
      .update({ payment_status: status })
      .eq("id", data.booking_id);

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}