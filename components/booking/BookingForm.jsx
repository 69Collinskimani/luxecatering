"use client";
import { useState } from "react";
import { format } from "date-fns";
import BookingCalendar from "./BookingCalendar";

export default function BookingForm({ packageData, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [form,         setForm]         = useState({ name:"", email:"", phone:"", venue:"", notes:"" });
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !selectedDate) {
      setError("Please fill in your name, email and select a date.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name:   form.name,
          customer_email:  form.email,
          customer_phone:  form.phone,
          event_date:      format(selectedDate, "yyyy-MM-dd"),
          event_type:      packageData?.eventType || "",
          guest_count:     packageData?.guestCount || 1,
          venue:           form.venue,
          package_id:      packageData?.package?.id,
          package_name:    packageData?.package?.name,
          selected_extras: packageData?.extras || [],
          base_amount:     packageData?.baseAmount || 0,
          extras_amount:   packageData?.extrasAmount || 0,
          total_amount:    packageData?.totalAmount || 0,
          notes:           form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      onSuccess?.(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-2xl font-black text-white text-center mb-2" style={{ fontFamily: "Georgia,serif" }}>📅 Choose Your Date</h3>
      <p className="text-gray-400 text-center mb-8">Select an available date for your event</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <BookingCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        {/* Form */}
        <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
          <h4 className="font-black text-white mb-5">Your Details</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Full Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                style={{ background: "#111", borderColor: "#333" }} placeholder="Your full name" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Email Address *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                style={{ background: "#111", borderColor: "#333" }} placeholder="your@email.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Phone Number</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                style={{ background: "#111", borderColor: "#333" }} placeholder="+254 700 000 000" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Venue / Location</label>
              <input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                style={{ background: "#111", borderColor: "#333" }} placeholder="Event venue or address" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Additional Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white resize-none"
                style={{ background: "#111", borderColor: "#333" }} placeholder="Any special requirements..." />
            </div>
          </div>

          {/* Package Summary */}
          {packageData && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: "#111", border: "1px solid #333" }}>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Booking Summary</div>
              <div className="flex justify-between text-sm text-gray-300">
                <span>{packageData.package?.name} Package</span>
                <span>{packageData.guestCount} guests</span>
              </div>
              <div className="flex justify-between text-sm font-black mt-1" style={{ color: "#C84B31" }}>
                <span>Total</span><span>${packageData.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && <p className="text-xs mt-3" style={{ color: "#E53E3E" }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading || !selectedDate}
            className="w-full mt-5 py-3 rounded-full font-black text-white text-sm disabled:opacity-40 transition"
            style={{ background: "#C84B31" }}>
            {loading ? "⏳ Booking..." : "Confirm Booking 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}