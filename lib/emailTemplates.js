// ─── Shared styles ────────────────────────────────────────────────────────────
const base = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LuxeCatering</title>
</head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#C84B31,#E07B54);padding:32px 40px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">🍽️</div>
            <h1 style="margin:0;color:white;font-size:24px;font-weight:900;letter-spacing:-0.5px;">LuxeCatering</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Premium Catering Services · Nairobi, Kenya</p>
          </td>
        </tr>

        <!-- Content -->
        <tr><td style="padding:40px;">${content}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1A1A1A;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;color:#888;font-size:12px;">LuxeCatering · Nairobi, Kenya</p>
            <p style="margin:0 0 8px;color:#888;font-size:12px;">📞 +254 700 000 000 · ✉️ info@luxecatering.co.ke</p>
            <p style="margin:0;color:#555;font-size:11px;">© 2026 LuxeCatering. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const badge = (text, color) =>
  `<span style="background:${color};color:white;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">${text}</span>`;

const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 0;color:#888;font-size:13px;width:140px;">${label}</td>
    <td style="padding:8px 0;color:#1A1A1A;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;

const divider = `<hr style="border:none;border-top:1px solid #E8E0D8;margin:20px 0;"/>`;

// ─── 1. Customer Booking Confirmation ─────────────────────────────────────────
export function customerConfirmation({ name, booking_ref, event_date, package_name, guest_count, venue, total_amount, extras }) {
  const extrasHtml = extras?.length
    ? extras.map(e => `<tr><td style="padding:6px 0;color:#666;font-size:13px;">+ ${e.name}</td><td style="padding:6px 0;text-align:right;color:#666;font-size:13px;">$${e.price}</td></tr>`).join("")
    : "";

  return base(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:16px;">🎉</div>
      <h2 style="margin:0 0 8px;color:#1A1A1A;font-size:24px;font-weight:900;">Booking Confirmed!</h2>
      <p style="margin:0;color:#666;font-size:15px;">Hi <strong>${name}</strong>, your event has been successfully booked.</p>
    </div>

    <!-- Booking Ref Badge -->
    <div style="background:#FFF8F0;border:2px solid #C84B31;border-radius:12px;padding:16px 24px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
      <p style="margin:0;color:#C84B31;font-size:24px;font-weight:900;letter-spacing:2px;">${booking_ref}</p>
      <p style="margin:4px 0 0;color:#888;font-size:11px;">Keep this for your records</p>
    </div>

    <!-- Booking Details -->
    <h3 style="margin:0 0 16px;color:#C84B31;font-size:14px;text-transform:uppercase;letter-spacing:1px;">📋 Event Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("📅 Event Date", event_date)}
      ${infoRow("📦 Package", package_name)}
      ${infoRow("👥 Guests", `${guest_count} guests`)}
      ${venue ? infoRow("📍 Venue", venue) : ""}
    </table>

    ${divider}

    <!-- Invoice Summary -->
    <h3 style="margin:0 0 16px;color:#C84B31;font-size:14px;text-transform:uppercase;letter-spacing:1px;">🧾 Invoice Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:6px 0;color:#1A1A1A;font-size:13px;">${package_name}</td>
        <td style="padding:6px 0;text-align:right;color:#1A1A1A;font-size:13px;">Included</td>
      </tr>
      ${extrasHtml}
    </table>
    <div style="background:#1A1A1A;border-radius:8px;padding:16px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;">Total (incl. 16% VAT)</td>
          <td style="text-align:right;color:#C84B31;font-size:20px;font-weight:900;">$${total_amount}</td>
        </tr>
      </table>
    </div>

    ${divider}

    <!-- Payment Info -->
    <div style="background:#F0FFF4;border-radius:8px;padding:16px;margin-bottom:24px;border-left:4px solid #2D6A4F;">
      <h4 style="margin:0 0 8px;color:#2D6A4F;font-size:13px;">💳 Payment Methods</h4>
      <p style="margin:0;color:#444;font-size:13px;line-height:1.6;">
        <strong>M-Pesa:</strong> 0700 000 000<br/>
        <strong>Bank:</strong> Equity Bank · A/C: 1234567890<br/>
        <strong>Reference:</strong> ${booking_ref}
      </p>
    </div>

    <!-- Next Steps -->
    <div style="background:#FFF8F0;border-radius:8px;padding:16px;border-left:4px solid #C84B31;">
      <h4 style="margin:0 0 8px;color:#C84B31;font-size:13px;">📌 What Happens Next?</h4>
      <p style="margin:0;color:#444;font-size:13px;line-height:1.8;">
        ✅ Our team will contact you within 24 hours<br/>
        ✅ Menu customization consultation<br/>
        ✅ Final headcount confirmation 1 week before<br/>
        ✅ We handle everything on the day!
      </p>
    </div>
  `);
}

// ─── 2. Admin New Booking Alert ───────────────────────────────────────────────
export function adminNewBooking({ booking_ref, customer_name, customer_email, customer_phone, event_date, event_type, package_name, guest_count, venue, total_amount, notes }) {
  return base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:40px;margin-bottom:12px;">🔔</div>
      <h2 style="margin:0 0 8px;color:#1A1A1A;font-size:22px;font-weight:900;">New Booking Received!</h2>
      <p style="margin:0;color:#666;font-size:14px;">A new event has been booked on LuxeCatering.</p>
    </div>

    <div style="background:#FFF8F0;border:2px solid #C84B31;border-radius:12px;padding:16px 24px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
      <p style="margin:0;color:#C84B31;font-size:24px;font-weight:900;letter-spacing:2px;">${booking_ref}</p>
    </div>

    <h3 style="margin:0 0 16px;color:#C84B31;font-size:14px;text-transform:uppercase;letter-spacing:1px;">👤 Customer Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("Name",    customer_name)}
      ${infoRow("Email",   customer_email)}
      ${infoRow("Phone",   customer_phone || "Not provided")}
    </table>

    ${divider}

    <h3 style="margin:0 0 16px;color:#C84B31;font-size:14px;text-transform:uppercase;letter-spacing:1px;">📋 Event Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("Event Date",  event_date)}
      ${infoRow("Event Type",  event_type || "Not specified")}
      ${infoRow("Package",     package_name)}
      ${infoRow("Guests",      `${guest_count} guests`)}
      ${venue ? infoRow("Venue", venue) : ""}
    </table>

    ${divider}

    <div style="background:#1A1A1A;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;">Total Amount</td>
          <td style="text-align:right;color:#C84B31;font-size:20px;font-weight:900;">$${total_amount}</td>
        </tr>
      </table>
    </div>

    ${notes ? `
    <div style="background:#F5F5F5;border-radius:8px;padding:16px;margin-bottom:16px;">
      <h4 style="margin:0 0 8px;color:#666;font-size:13px;">📝 Customer Notes</h4>
      <p style="margin:0;color:#444;font-size:13px;">${notes}</p>
    </div>` : ""}

    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin"
        style="background:#C84B31;color:white;padding:12px 32px;border-radius:24px;text-decoration:none;font-weight:900;font-size:14px;display:inline-block;">
        View in Admin Dashboard →
      </a>
    </div>
  `);
}

// ─── 3. Booking Cancellation ──────────────────────────────────────────────────
export function bookingCancellation({ name, booking_ref, event_date }) {
  return base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:16px;">😔</div>
      <h2 style="margin:0 0 8px;color:#1A1A1A;font-size:22px;font-weight:900;">Booking Cancelled</h2>
      <p style="margin:0;color:#666;font-size:14px;">Hi <strong>${name}</strong>, your booking has been cancelled.</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("Booking Ref", booking_ref)}
      ${infoRow("Event Date",  event_date)}
    </table>
    <div style="background:#FFF0F0;border-radius:8px;padding:16px;border-left:4px solid #E53E3E;">
      <p style="margin:0;color:#444;font-size:13px;line-height:1.6;">
        If you believe this is a mistake or would like to rebook, please contact us at<br/>
        <strong>info@luxecatering.co.ke</strong> or <strong>+254 700 000 000</strong>
      </p>
    </div>
  `);
}

// ─── 4. Payment Received ──────────────────────────────────────────────────────
export function paymentReceived({ name, booking_ref, amount, event_date }) {
  return base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:16px;">✅</div>
      <h2 style="margin:0 0 8px;color:#1A1A1A;font-size:22px;font-weight:900;">Payment Received!</h2>
      <p style="margin:0;color:#666;font-size:14px;">Hi <strong>${name}</strong>, we've received your payment.</p>
    </div>
    <div style="background:#F0FFF4;border:2px solid #2D6A4F;border-radius:12px;padding:16px 24px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;">Amount Paid</p>
      <p style="margin:0;color:#2D6A4F;font-size:28px;font-weight:900;">$${amount}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow("Booking Ref", booking_ref)}
      ${infoRow("Event Date",  event_date)}
      ${infoRow("Status",      "✅ Fully Paid")}
    </table>
  `);
}

// ─── 5. Event Reminder ────────────────────────────────────────────────────────
export function eventReminder({ name, booking_ref, event_date, package_name, guest_count, venue }) {
  return base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:16px;">⏰</div>
      <h2 style="margin:0 0 8px;color:#1A1A1A;font-size:22px;font-weight:900;">Your Event is in 3 Days!</h2>
      <p style="margin:0;color:#666;font-size:14px;">Hi <strong>${name}</strong>, just a reminder about your upcoming event.</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("📅 Event Date",  event_date)}
      ${infoRow("📦 Package",     package_name)}
      ${infoRow("👥 Guests",      `${guest_count} guests`)}
      ${venue ? infoRow("📍 Venue", venue) : ""}
    </table>
    <div style="background:#FFF8F0;border-radius:8px;padding:16px;border-left:4px solid #C84B31;">
      <h4 style="margin:0 0 8px;color:#C84B31;font-size:13px;">📌 Reminder Checklist</h4>
      <p style="margin:0;color:#444;font-size:13px;line-height:1.8;">
        ✅ Confirm final guest count with us<br/>
        ✅ Ensure venue is accessible by 8am<br/>
        ✅ Any last-minute dietary requirements?<br/>
        ✅ Our team arrives 2 hours before the event
      </p>
    </div>
    <p style="margin:20px 0 0;color:#888;font-size:13px;text-align:center;">
      Questions? Call us at <strong>+254 700 000 000</strong>
    </p>
  `);
}