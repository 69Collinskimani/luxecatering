"use client";
import {
  Document, Page, Text, View, StyleSheet, Image, Font
} from "@react-pdf/renderer";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:         { fontFamily: "Helvetica", fontSize: 10, color: "#1A1A1A", backgroundColor: "#FAF7F2", padding: 40 },
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 },
  logo:         { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#C84B31" },
  logoSub:      { fontSize: 9, color: "#888", marginTop: 2 },
  invoiceBadge: { backgroundColor: "#C84B31", borderRadius: 4, padding: "6 12", alignSelf: "flex-start" },
  invoiceBadgeTxt: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 12 },
  divider:      { borderBottom: "2 solid #E8E0D8", marginVertical: 16 },
  thinDivider:  { borderBottom: "1 solid #E8E0D8", marginVertical: 8 },
  row:          { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  col:          { flex: 1 },
  label:        { fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  value:        { fontSize: 10, color: "#1A1A1A", fontFamily: "Helvetica-Bold" },
  valueNormal:  { fontSize: 10, color: "#444" },
  tableHeader:  { flexDirection: "row", backgroundColor: "#1A1A1A", padding: "8 10", borderRadius: 4, marginBottom: 4 },
  tableHeaderTxt: { color: "white", fontSize: 9, fontFamily: "Helvetica-Bold", flex: 1 },
  tableRow:     { flexDirection: "row", padding: "8 10", borderBottom: "1 solid #E8E0D8" },
  tableCell:    { flex: 1, fontSize: 9, color: "#444" },
  totalBox:     { backgroundColor: "#1A1A1A", borderRadius: 8, padding: "16 20", marginTop: 16 },
  totalRow:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalLabel:   { color: "#888", fontSize: 9 },
  totalValue:   { color: "#888", fontSize: 9 },
  grandLabel:   { color: "#C84B31", fontSize: 14, fontFamily: "Helvetica-Bold" },
  grandValue:   { color: "#C84B31", fontSize: 14, fontFamily: "Helvetica-Bold" },
  statusBadge:  { borderRadius: 4, padding: "4 10", alignSelf: "flex-start" },
  footer:       { position: "absolute", bottom: 30, left: 40, right: 40 },
  footerText:   { fontSize: 8, color: "#aaa", textAlign: "center" },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#C84B31", marginBottom: 8 },
  infoBox:      { backgroundColor: "white", borderRadius: 8, padding: 14, border: "1 solid #E8E0D8", marginBottom: 12 },
  noteBox:      { backgroundColor: "#FFF8F0", borderRadius: 6, padding: 10, marginTop: 12, border: "1 solid #FFD4C2" },
  noteTxt:      { fontSize: 9, color: "#C84B31" },
});

// ─── Invoice PDF Document ─────────────────────────────────────────────────────
export function InvoiceDocument({ invoice, booking }) {
  const extras = booking?.selected_extras
    ? (typeof booking.selected_extras === "string" ? JSON.parse(booking.selected_extras) : booking.selected_extras)
    : [];

  const subtotal    = booking?.total_amount || 0;
  const taxAmount   = invoice?.tax_amount   || subtotal * 0.16;
  const grandTotal  = invoice?.total_amount || subtotal + taxAmount;
  const isPaid      = invoice?.status === "paid";

  const statusColors = { paid: "#2D6A4F", unpaid: "#C84B31", overdue: "#E53E3E" };
  const statusColor  = statusColors[invoice?.status] || "#C84B31";

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.header}>
          <View>
            <Text style={S.logo}>🍽️ LuxeCatering</Text>
            <Text style={S.logoSub}>Premium Catering Services · Nairobi, Kenya</Text>
            <Text style={S.logoSub}>info@luxecatering.co.ke · +254 700 000 000</Text>
          </View>
          <View>
            <View style={S.invoiceBadge}>
              <Text style={S.invoiceBadgeTxt}>INVOICE</Text>
            </View>
            <Text style={{ fontSize: 9, color: "#888", marginTop: 6, textAlign: "right" }}>
              {invoice?.invoice_number || "INV-XXXXXXXX"}
            </Text>
            <View style={[S.statusBadge, { backgroundColor: statusColor, marginTop: 6 }]}>
              <Text style={{ color: "white", fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                {(invoice?.status || "UNPAID").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={S.divider} />

        {/* ── Bill To + Invoice Details ── */}
        <View style={S.row}>
          <View style={[S.infoBox, { flex: 1, marginRight: 8 }]}>
            <Text style={S.sectionTitle}>Bill To</Text>
            <Text style={S.value}>{invoice?.customer_name || booking?.customer_name}</Text>
            <Text style={S.valueNormal}>{invoice?.customer_email || booking?.customer_email}</Text>
            {booking?.customer_phone && <Text style={S.valueNormal}>{booking.customer_phone}</Text>}
            {booking?.venue && <Text style={S.valueNormal}>📍 {booking.venue}</Text>}
          </View>
          <View style={[S.infoBox, { flex: 1, marginLeft: 8 }]}>
            <Text style={S.sectionTitle}>Invoice Details</Text>
            <View style={S.row}>
              <Text style={S.label}>Invoice #</Text>
              <Text style={S.value}>{invoice?.invoice_number}</Text>
            </View>
            <View style={S.row}>
              <Text style={S.label}>Booking Ref</Text>
              <Text style={S.value}>{booking?.booking_ref}</Text>
            </View>
            <View style={S.row}>
              <Text style={S.label}>Event Date</Text>
              <Text style={S.value}>{booking?.event_date}</Text>
            </View>
            <View style={S.row}>
              <Text style={S.label}>Due Date</Text>
              <Text style={[S.value, { color: isPaid ? "#2D6A4F" : "#C84B31" }]}>
                {isPaid ? "✓ Paid" : invoice?.due_date || "On Event Day"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Event Summary ── */}
        <View style={S.infoBox}>
          <Text style={S.sectionTitle}>Event Summary</Text>
          <View style={S.row}>
            <View style={S.col}>
              <Text style={S.label}>Event Type</Text>
              <Text style={S.valueNormal}>{booking?.event_type || "—"}</Text>
            </View>
            <View style={S.col}>
              <Text style={S.label}>Guest Count</Text>
              <Text style={S.valueNormal}>{booking?.guest_count} guests</Text>
            </View>
            <View style={S.col}>
              <Text style={S.label}>Package</Text>
              <Text style={S.valueNormal}>{booking?.package_name || "—"}</Text>
            </View>
            <View style={S.col}>
              <Text style={S.label}>Status</Text>
              <Text style={[S.valueNormal, { color: statusColor }]}>{booking?.status?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ── Line Items ── */}
        <Text style={S.sectionTitle}>Items</Text>
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderTxt, { flex: 3 }]}>Description</Text>
          <Text style={[S.tableHeaderTxt, { textAlign: "right" }]}>Amount</Text>
        </View>

        {/* Base Package */}
        <View style={S.tableRow}>
          <Text style={[S.tableCell, { flex: 3 }]}>{booking?.package_name || "Catering Package"}</Text>
          <Text style={[S.tableCell, { textAlign: "right" }]}>${(booking?.base_amount || 0).toFixed(2)}</Text>
        </View>

        {/* Extras */}
        {extras.map((extra, i) => (
          <View key={i} style={S.tableRow}>
            <Text style={[S.tableCell, { flex: 3, color: "#666" }]}>  + {extra.name}</Text>
            <Text style={[S.tableCell, { textAlign: "right" }]}>${(extra.price || 0).toFixed(2)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={S.totalBox}>
          <View style={S.totalRow}>
            <Text style={S.totalLabel}>Subtotal</Text>
            <Text style={S.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={S.totalRow}>
            <Text style={S.totalLabel}>VAT (16%)</Text>
            <Text style={S.totalValue}>${taxAmount.toFixed(2)}</Text>
          </View>
          <View style={[S.thinDivider, { borderColor: "#444", marginVertical: 8 }]} />
          <View style={S.totalRow}>
            <Text style={S.grandLabel}>Total Due</Text>
            <Text style={S.grandValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* ── Payment Note ── */}
        <View style={S.noteBox}>
          <Text style={S.noteTxt}>
            💳 Payment Methods: M-Pesa (0700 000 000) · Bank Transfer (Equity Bank, A/C: 1234567890) · Cash on Event Day{"\n"}
            Please quote your booking reference {booking?.booking_ref} when making payment.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer}>
          <View style={[S.divider, { marginBottom: 8 }]} />
          <Text style={S.footerText}>
            LuxeCatering · Nairobi, Kenya · info@luxecatering.co.ke · +254 700 000 000{"\n"}
            Thank you for choosing LuxeCatering. We look forward to making your event unforgettable! 🍽️
          </Text>
        </View>

      </Page>
    </Document>
  );
}