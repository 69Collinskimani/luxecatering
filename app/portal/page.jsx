"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  CircleX,
  ClipboardList,
  CreditCard,
  Download,
  HandHelping,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  Tag,
  Theater,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { InvoiceDocument } from "@/components/booking/InvoicePDF";

const PAYMENT_COLORS = { unpaid: "#E53E3E", partial: "#F59E0B", paid: "#2D6A4F" };

const STATUS_STEPS = [
  { key: "pending", label: "Booking Received", Icon: ClipboardList, desc: "We've received your booking request." },
  { key: "confirmed", label: "Booking Confirmed", Icon: CheckCircle2, desc: "Your event is confirmed! We'll be there." },
  { key: "completed", label: "Event Completed", Icon: HandHelping, desc: "Hope you had an amazing event!" },
];

const EVENT_DETAILS = [
  { label: "Event Date", key: "event_date", Icon: CalendarDays },
  { label: "Event Type", key: "event_type", Icon: Theater, fallback: "-" },
  { label: "Package", key: "package_name", Icon: Tag, fallback: "-" },
  { label: "Guests", key: "guest_count", Icon: Users, format: (value) => `${value} guests` },
  { label: "Venue", key: "venue", Icon: MapPin, fallback: "-" },
  { label: "Notes", key: "notes", Icon: ClipboardList, fallback: "-" },
];

function StatusTracker({ status }) {
  const isCancelled = status === "cancelled";
  const currentIdx = STATUS_STEPS.findIndex((step) => step.key === status);

  if (isCancelled) {
    return (
      <div className="rounded-2xl p-6 text-center border" style={{ background: "#1a0505", borderColor: "#E53E3E" }}>
        <div className="mb-3 flex justify-center">
          <CircleX size={42} strokeWidth={2.2} style={{ color: "#F87171" }} />
        </div>
        <h3 className="text-lg font-black text-white mb-1">Booking Cancelled</h3>
        <p className="text-sm text-gray-400">This booking has been cancelled. Contact us to rebook.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
      <h3 className="font-black text-white mb-6 inline-flex items-center gap-2">
        <MapPin size={18} strokeWidth={2.2} />
        Booking Status
      </h3>
      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-0.5" style={{ background: "#333" }} />
        <div className="absolute left-5 top-5 w-0.5 transition-all duration-700" style={{ background: "#2D6A4F", height: `${Math.max(0, (currentIdx / (STATUS_STEPS.length - 1)) * 100)}%` }} />

        {STATUS_STEPS.map((step, index) => {
          const done = index <= currentIdx;
          const current = index === currentIdx;
          const StepIcon = step.Icon;

          return (
            <div key={step.key} className="flex items-start gap-4 mb-6 relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10 transition-all"
                style={{ background: done ? (current ? "#C84B31" : "#2D6A4F") : "#222", border: `2px solid ${done ? (current ? "#C84B31" : "#2D6A4F") : "#444"}` }}
              >
                {done ? current ? <StepIcon size={18} strokeWidth={2.4} className="text-white" /> : <Check size={18} strokeWidth={2.8} className="text-white" /> : <span style={{ color: "#555" }}>{index + 1}</span>}
              </div>
              <div className="pt-1">
                <div className="font-black text-sm" style={{ color: done ? "white" : "#555" }}>{step.label}</div>
                <div className="text-xs mt-0.5" style={{ color: done ? "#888" : "#444" }}>{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortalContent() {
  const params = useSearchParams();
  const initialRef = params.get("ref");
  const initialEmail = params.get("email");
  const [ref, setRef] = useState(params.get("ref") || "");
  const [email, setEmail] = useState(params.get("email") || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = useCallback(async () => {
    if (!ref.trim() || !email.trim()) {
      setError("Please enter both booking reference and email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/portal?ref=${encodeURIComponent(ref.trim())}&email=${encodeURIComponent(email.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [email, ref]);

  useEffect(() => {
    if (initialRef && initialEmail) lookup();
  }, [initialEmail, initialRef, lookup]);

  return (
    <div className="min-h-screen px-4 py-16" style={{ background: "#0d0d0d" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "rgba(200,75,49,0.15)", color: "#C84B31" }}>
            <UtensilsCrossed size={26} strokeWidth={2.2} />
          </Link>
          <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Georgia,serif" }}>
            Track Your <span style={{ color: "#C84B31" }}>Booking</span>
          </h1>
          <p className="text-gray-400 text-sm">Enter your booking reference and email to view your event details</p>
        </div>

        {!data && (
          <div className="rounded-2xl p-8 border border-gray-700 mb-6" style={{ background: "#1a1a1a" }}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Booking Reference</label>
                <input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="e.g. BK-A1B2C3D4" className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white font-mono tracking-widest" style={{ background: "#111", borderColor: "#333" }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} placeholder="Email used when booking" className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white" style={{ background: "#111", borderColor: "#333" }} />
              </div>
            </div>
            {error && <p className="text-xs mb-4" style={{ color: "#E53E3E" }}>{error}</p>}
            <button onClick={lookup} disabled={loading} className="w-full py-3 rounded-full font-black text-white text-sm disabled:opacity-50 transition inline-flex items-center justify-center gap-2" style={{ background: "#C84B31" }}>
              <Search size={16} strokeWidth={2.3} className={loading ? "animate-pulse" : ""} />
              {loading ? "Looking up..." : "Find My Booking"}
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="rounded-2xl p-6 text-center border" style={{ background: "linear-gradient(135deg,#1a0a00,#2a1000)", borderColor: "#C84B31" }}>
              <div className="mb-3 flex justify-center">
                <HandHelping size={34} strokeWidth={2.2} style={{ color: "#FFD1B8" }} />
              </div>
              <h2 className="text-xl font-black text-white mb-1">Hi, {data.booking.customer_name.split(" ")[0]}!</h2>
              <p className="text-gray-400 text-sm">Here&apos;s everything about your upcoming event.</p>
              <div className="mt-3 inline-block px-4 py-1 rounded-full text-sm font-black" style={{ background: "#C84B31", color: "white" }}>{data.booking.booking_ref}</div>
            </div>

            <StatusTracker status={data.booking.status} />

            <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
              <h3 className="font-black text-white mb-4 inline-flex items-center gap-2">
                <ClipboardList size={18} strokeWidth={2.2} />
                Event Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {EVENT_DETAILS.map(({ label, key, Icon, fallback, format }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "#111" }}>
                    <div className="text-xs text-gray-500 mb-1 inline-flex items-center gap-1.5">
                      <Icon size={14} strokeWidth={2.1} />
                      {label}
                    </div>
                    <div className="text-sm font-bold text-white">{format ? format(data.booking[key]) : data.booking[key] || fallback}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
              <h3 className="font-black text-white mb-4 inline-flex items-center gap-2">
                <CreditCard size={18} strokeWidth={2.2} />
                Payment
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-black" style={{ color: "#C84B31" }}>${data.invoice?.total_amount?.toFixed(2) || "-"}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Amount (incl. 16% VAT)</div>
                </div>
                <span className="px-4 py-2 rounded-full text-sm font-black text-white capitalize" style={{ background: PAYMENT_COLORS[data.booking.payment_status] || "#666" }}>{data.booking.payment_status}</span>
              </div>

              {data.booking.payment_status !== "paid" && (
                <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #333" }}>
                  <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider inline-flex items-center gap-1.5">
                    <CreditCard size={14} strokeWidth={2.2} />
                    How to Pay
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed space-y-1">
                    <div><strong>M-Pesa:</strong> 0700 000 000</div>
                    <div><strong>Bank:</strong> Equity Bank · A/C: 1234567890</div>
                    <div><strong>Reference:</strong> <span style={{ color: "#C84B31" }}>{data.booking.booking_ref}</span></div>
                  </div>
                </div>
              )}

              {data.booking.payment_status === "paid" && (
                <div className="rounded-xl p-4 text-center" style={{ background: "#0a1a0a", border: "1px solid #2D6A4F" }}>
                  <div className="mb-1 flex justify-center">
                    <CheckCircle2 size={24} strokeWidth={2.2} style={{ color: "#86EFAC" }} />
                  </div>
                  <div className="text-sm font-black" style={{ color: "#2D6A4F" }}>Payment Complete!</div>
                  <div className="text-xs text-gray-500 mt-1">Thank you, you&apos;re all set!</div>
                </div>
              )}
            </div>

            {data.invoice && (
              <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black text-white mb-4 inline-flex items-center gap-2">
                  <ReceiptText size={18} strokeWidth={2.2} />
                  Invoice
                </h3>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div>
                    <div className="font-bold text-white">{data.invoice.invoice_number}</div>
                    <div className="text-xs text-gray-500">Due: {data.invoice.due_date || "On event day"}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black text-white capitalize" style={{ background: PAYMENT_COLORS[data.invoice.status] || "#666" }}>{data.invoice.status}</span>
                </div>
                <PDFDownloadLink document={<InvoiceDocument invoice={data.invoice} booking={data.booking} />} fileName={`Invoice-${data.invoice.invoice_number}.pdf`}>
                  {({ loading: pdfLoading }) => (
                    <button disabled={pdfLoading} className="w-full py-3 rounded-full text-sm font-black text-white disabled:opacity-50 transition inline-flex items-center justify-center gap-2" style={{ background: "#2D6A4F" }}>
                      <Download size={16} strokeWidth={2.2} className={pdfLoading ? "animate-pulse" : ""} />
                      {pdfLoading ? "Generating..." : "Download Invoice PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            )}

            <div className="rounded-2xl p-6 border border-gray-700 text-center" style={{ background: "#1a1a1a" }}>
              <h3 className="font-black text-white mb-2">Need Help?</h3>
              <p className="text-xs text-gray-400 mb-4">Our team is available to assist you with anything.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href="tel:+254769311896" className="px-5 py-2 rounded-full text-sm font-bold text-white transition inline-flex items-center gap-2" style={{ background: "#2D6A4F" }}>
                  <Phone size={16} strokeWidth={2.2} />
                  Call Us
                </a>
                <a href="mailto:litetech598@gmail.com" className="px-5 py-2 rounded-full text-sm font-bold text-white transition inline-flex items-center gap-2" style={{ background: "#333" }}>
                  <Mail size={16} strokeWidth={2.2} />
                  Email Us
                </a>
                <button onClick={() => { setData(null); setRef(""); setEmail(""); }} className="px-5 py-2 rounded-full text-sm font-bold border border-gray-600 text-gray-400 hover:border-gray-400 transition inline-flex items-center gap-2">
                  <Search size={16} strokeWidth={2.2} />
                  Look Up Another
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">Back to LuxeCatering</Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPortal() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <UtensilsCrossed size={44} strokeWidth={2.2} className="animate-bounce" style={{ color: "#C84B31" }} />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}
