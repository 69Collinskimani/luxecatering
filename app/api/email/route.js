import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  customerConfirmation,
  adminNewBooking,
  bookingCancellation,
  paymentReceived,
  eventReminder,
} from "@/lib/emailTemplates";

const resend     = new Resend(process.env.RESEND_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "litetech598@gmail.com";
const FROM_EMAIL  = process.env.FROM_EMAIL  || "onboarding@resend.dev"; // use resend default until domain verified

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, booking_id, to_email, name, booking_ref, event_date, package_name,
            guest_count, venue, total_amount, extras, notes, customer_email,
            customer_name, customer_phone, event_type, amount } = body;

    let customerSubject = "";
    let customerHtml    = "";
    let adminSubject    = "";
    let adminHtml       = "";

    switch (type) {

      case "confirmation":
        customerSubject = `🎉 Booking Confirmed — ${booking_ref} | LuxeCatering`;
        customerHtml    = customerConfirmation({ name, booking_ref, event_date, package_name, guest_count, venue, total_amount, extras: extras || [] });
        adminSubject    = `🔔 New Booking: ${booking_ref} — ${customer_name || name}`;
        adminHtml       = adminNewBooking({ booking_ref, customer_name: customer_name || name, customer_email: customer_email || to_email, customer_phone, event_date, event_type, package_name, guest_count, venue, total_amount, notes });
        break;

      case "cancellation":
        customerSubject = `Booking Cancelled — ${booking_ref} | LuxeCatering`;
        customerHtml    = bookingCancellation({ name, booking_ref, event_date });
        adminSubject    = `❌ Booking Cancelled: ${booking_ref}`;
        adminHtml       = adminNewBooking({ booking_ref, customer_name: name, customer_email: to_email, event_date, package_name, guest_count, venue, total_amount: 0, notes: "CANCELLED" });
        break;

      case "payment":
        customerSubject = `✅ Payment Received — ${booking_ref} | LuxeCatering`;
        customerHtml    = paymentReceived({ name, booking_ref, event_date, amount });
        adminSubject    = `💰 Payment Received: ${booking_ref} — $${amount}`;
        adminHtml       = adminNewBooking({ booking_ref, customer_name: name, customer_email: to_email, event_date, package_name, guest_count, venue, total_amount: amount, notes: `Payment of $${amount} received` });
        break;

      case "reminder":
        customerSubject = `⏰ Reminder: Your event is in 3 days! | LuxeCatering`;
        customerHtml    = eventReminder({ name, booking_ref, event_date, package_name, guest_count, venue });
        // No admin email for reminders
        break;

      default:
        return Response.json({ error: "Unknown email type" }, { status: 400 });
    }

    const results = [];

    // Send to customer
    if (customerHtml) {
      const { data, error } = await resend.emails.send({
        from:    `LuxeCatering <${FROM_EMAIL}>`,
        to:      [to_email],
        subject: customerSubject,
        html:    customerHtml,
      });
      if (error) console.error("Customer email error:", error);
      else results.push({ to: to_email, id: data?.id });
    }

    // Send to admin
    if (adminHtml) {
      const { data, error } = await resend.emails.send({
        from:    `LuxeCatering <${FROM_EMAIL}>`,
        to:      [ADMIN_EMAIL],
        subject: adminSubject,
        html:    adminHtml,
      });
      if (error) console.error("Admin email error:", error);
      else results.push({ to: ADMIN_EMAIL, id: data?.id });
    }

    // Log to Supabase
    if (booking_id) {
      await supabaseAdmin.from("email_logs").insert([{
        booking_id,
        to_email,
        subject: customerSubject,
        type,
        status: "sent",
      }]);
    }

    return Response.json({ success: true, results });
  } catch (err) {
    console.error("email send error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}