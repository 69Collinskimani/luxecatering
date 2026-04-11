import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request, { params }) {
  try {
    const { id }                     = await params;
    const { status, payment_status } = await request.json();

    const updates = {};
    if (status)         updates.status         = status;
    if (payment_status) updates.payment_status = payment_status;

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // If cancelled — free up availability + send email
    if (status === "cancelled") {
      await supabaseAdmin
        .from("availability")
        .upsert({ date: data.event_date, status: "available" }, { onConflict: "date" });

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:        "cancellation",
          to_email:    data.customer_email,
          name:        data.customer_name,
          booking_ref: data.booking_ref,
          event_date:  data.event_date,
        }),
      }).catch(e => console.warn("cancel email failed:", e));
    }

    // If payment marked as paid — update invoice + send receipt
    if (payment_status === "paid") {
      const { data: inv } = await supabaseAdmin
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("booking_id", id)
        .select()
        .single();

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:        "payment",
          to_email:    data.customer_email,
          name:        data.customer_name,
          booking_ref: data.booking_ref,
          event_date:  data.event_date,
          amount:      inv?.total_amount?.toFixed(2),
        }),
      }).catch(e => console.warn("payment email failed:", e));
    }

    return Response.json({ success: true, data });
  } catch (err) {
    console.error("booking update error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
