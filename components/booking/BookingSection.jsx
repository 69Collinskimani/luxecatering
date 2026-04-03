"use client";
import { useState }        from "react";
import PackageCustomizer   from "./PackageCustomizer";
import BookingForm         from "./BookingForm";
import InvoiceDownload     from "./InvoiceDownload";

export default function BookingSection() {
  const [step,        setStep]        = useState("packages"); // packages | calendar | success
  const [packageData, setPackageData] = useState(null);
  const [booking,     setBooking]     = useState(null);

  const handlePackageProceed = data => {
    setPackageData(data);
    setStep("calendar");
  };

  const handleBookingSuccess = data => {
    setBooking(data.booking);
    setStep("success");
  };

  return (
    <section id="booking" className="py-24 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-3">Reserve Your Date</div>
          <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: "Georgia,serif" }}>
            Book Your <span className="text-yellow-400">Event</span>
          </h2>
          <p className="text-gray-400">Customize your package, pick a date, and we'll handle the rest</p>
        </div>

        {/* Flow Steps Indicator */}
        {step !== "success" && (
          <div className="flex items-center justify-center gap-3 mb-12">
            {[["packages","📦 Package"],["calendar","📅 Date & Details"]].map(([s, label], i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => step === "calendar" && s === "packages" && setStep("packages")}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ background: step === s ? "#C84B31" : step === "calendar" && s === "packages" ? "#2D6A4F" : "#333", color: "white" }}>
                    {step === "calendar" && s === "packages" ? "✓" : i + 1}
                  </div>
                  <span className="text-sm font-semibold hidden sm:block"
                    style={{ color: step === s ? "#C84B31" : step === "calendar" && s === "packages" ? "#2D6A4F" : "#666" }}>{label}</span>
                </div>
                {i < 1 && <div className="w-12 h-0.5" style={{ background: step === "calendar" ? "#2D6A4F" : "#333" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {step === "packages" && <PackageCustomizer onProceed={handlePackageProceed} />}
        {step === "calendar" && <BookingForm packageData={packageData} onSuccess={handleBookingSuccess} />}

        {/* Success */}
        {step === "success" && booking && (
          <div className="max-w-lg mx-auto text-center">
            <div className="rounded-2xl p-10 border" style={{ background: "#0a1a0a", borderColor: "#2D6A4F" }}>
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black mb-2" style={{ color: "#2D6A4F", fontFamily: "Georgia,serif" }}>Booking Confirmed!</h3>
              <p className="text-gray-400 mb-6">Your event has been successfully booked. Check your email for confirmation.</p>

              <div className="rounded-xl p-4 mb-6 text-left space-y-2" style={{ background: "#111", border: "1px solid #333" }}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking Ref</span>
                  <span className="font-black text-yellow-400">{booking.booking_ref}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Package</span>
                  <span className="text-white">{booking.package_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Event Date</span>
                  <span className="text-white">{booking.event_date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Guests</span>
                  <span className="text-white">{booking.guest_count}</span>
                </div>
                <div className="flex justify-between text-sm font-black" style={{ color: "#C84B31" }}>
                  <span>Total</span>
                  <span>${(booking.total_amount * 1.16).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <InvoiceDownload
                  bookingRef={booking.booking_ref}
                  email={booking.customer_email}
                />
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <button onClick={() => { setStep("packages"); setPackageData(null); setBooking(null); }}
                  className="px-6 py-2 rounded-full text-sm font-bold border border-gray-600 text-gray-300 hover:border-gray-400 transition">
                  Book Another
                </button>
                <a href={`/portal?ref=${booking.booking_ref}&email=${booking.customer_email}`}
                  className="px-6 py-2 rounded-full text-sm font-bold text-white transition"
                  style={{ background: "#C84B31" }}>
                  Track Booking →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}