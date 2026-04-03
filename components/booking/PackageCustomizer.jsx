"use client";
import { useState, useEffect } from "react";

const EVENT_TYPES = [
  "Wedding", "Corporate Event", "Birthday Party", "Graduation",
  "Anniversary", "Baby Shower", "Fundraiser", "Other",
];

export default function PackageCustomizer({ onProceed }) {
  const [packages,       setPackages]       = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [guestCount,     setGuestCount]     = useState(50);
  const [eventType,      setEventType]      = useState("");
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState(false);
  const [step,           setStep]           = useState(1);
 const [retryKey,       setRetryKey]       = useState(0);

useEffect(() => {
  fetch("/api/packages")
    .then(r => {
      if (!r.ok) {
        let message = "Failed to load packages.";
        if (r.status === 404) message = "No packages found (404).";
        else if (r.status === 500) message = "Server error (500). Please try again later.";
        throw new Error(message);
      }
      return r.json();
    })
    .then(data => {
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data) ? data.data : [];
      setPackages(list);
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to load packages:", err);
      setFetchError(err.message || true);
      setLoading(false);
    });
}, [retryKey]);

  const toggleExtra = extra => {
    setSelectedExtras(prev =>
      prev.find(e => e.name === extra.name)
        ? prev.filter(e => e.name !== extra.name)
        : [...prev, extra]
    );
  };

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const subtotal    = (selected?.base_price || 0) + extrasTotal;
  const tax         = subtotal * 0.16;
  const total       = subtotal + tax;

  const handleProceed = () => {
    onProceed?.({
      package:      selected,
      extras:       selectedExtras,
      guestCount,
      eventType,
      baseAmount:   selected?.base_price || 0,
      extrasAmount: extrasTotal,
      totalAmount:  total,
    });
  };

  // ── Loading ──
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🍽️</div>
        <p className="text-gray-400">Loading packages...</p>
      </div>
    </div>
  );

  // ── Fetch error ──
if (fetchError) return (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-gray-400 mb-4">{typeof fetchError === "string" ? fetchError : "Failed to load packages. Please try again."}</p>
      <button
        onClick={() => {
          setLoading(true);      // ✅ triggered by user action, not by the effect itself
          setFetchError(false);
          setRetryKey(k => k + 1);
        }}
        className="px-6 py-2 rounded-full font-black text-white text-sm"
        style={{ background: "#C84B31" }}
      >
        Retry
      </button>
    </div>
  </div>
);

  // ── Empty state ──
  if (packages.length === 0) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gray-400">No packages available at the moment.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[["1","Choose Package"],["2","Customize"],["3","Summary"]].map(([n, label], i) => (
          <div key={n} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${step >= i+1 ? "text-white" : "text-gray-500"}`}
                style={{ background: step >= i+1 ? "#C84B31" : "#333" }}
              >{n}</div>
              <span className={`text-sm font-semibold hidden sm:block ${step >= i+1 ? "text-white" : "text-gray-500"}`}>{label}</span>
            </div>
            {i < 2 && <div className="w-8 h-0.5 mx-1" style={{ background: step > i+1 ? "#C84B31" : "#333" }} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Choose Package ── */}
      {step === 1 && (
        <div>
          <h3 className="text-2xl font-black text-white text-center mb-2" style={{ fontFamily: "Georgia,serif" }}>Choose Your Package</h3>
          <p className="text-gray-400 text-center mb-8">Select the package that best fits your event</p>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} onClick={() => setSelected(pkg)}
                className="relative rounded-2xl p-6 border-2 cursor-pointer transition-all duration-200 hover:-translate-y-1"
                style={{ background: selected?.id === pkg.id ? "#1a0a00" : "#1a1a1a", borderColor: selected?.id === pkg.id ? "#C84B31" : "#333" }}>
                {selected?.id === pkg.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full text-white" style={{ background: "#C84B31" }}>✓ Selected</div>
                )}
                <div className="text-3xl font-black mb-1" style={{ color: "#C84B31" }}>${pkg.base_price}</div>
                <div className="text-xl font-black text-white mb-2">{pkg.name}</div>
                <p className="text-xs text-gray-400 mb-4">{pkg.description}</p>
                <div className="text-xs font-bold mb-3" style={{ color: "#C84B31" }}>👥 Up to {pkg.max_guests} guests</div>
                <ul className="space-y-2">
                  {pkg.features?.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                      <span style={{ color: "#2D6A4F" }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => selected && setStep(2)} disabled={!selected}
              className="px-10 py-3 rounded-full font-black text-white text-sm disabled:opacity-40 transition"
              style={{ background: "#C84B31" }}>
              Next: Customize →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Customize ── */}
      {step === 2 && selected && (
        <div>
          <h3 className="text-2xl font-black text-white text-center mb-2" style={{ fontFamily: "Georgia,serif" }}>Customize Your Package</h3>
          <p className="text-gray-400 text-center mb-8">Add extras and tell us about your event</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left — Event Details */}
            <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
              <h4 className="font-black text-white mb-4">📋 Event Details</h4>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 mb-1 block">Event Type</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                  style={{ background: "#111", borderColor: "#333" }}>
                  <option value="">Select event type...</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  Guest Count: <span style={{ color: "#C84B31" }}>{guestCount}</span>
                </label>
                <input type="range" min={5} max={selected.max_guests} value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  className="w-full accent-orange-600" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span><span>{selected.max_guests} max</span>
                </div>
              </div>

              {/* Price Summary */}
              <div className="rounded-xl p-4 mt-4" style={{ background: "#111", border: "1px solid #333" }}>
                <h5 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Price Breakdown</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>{selected.name} Package</span>
                    <span>${selected.base_price}</span>
                  </div>
                  {selectedExtras.map(e => (
                    <div key={e.name} className="flex justify-between text-gray-300">
                      <span>{e.name}</span><span>+${e.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-700 pt-2 flex justify-between text-gray-400">
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>VAT (16%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between font-black text-lg">
                    <span style={{ color: "#C84B31" }}>Total</span>
                    <span style={{ color: "#C84B31" }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Extras */}
            <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
              <h4 className="font-black text-white mb-4">✨ Add Extras</h4>
              {selected.extras?.length > 0 ? (
                <div className="space-y-3">
                  {selected.extras.map(extra => {
                    const isSelected = selectedExtras.find(e => e.name === extra.name);
                    return (
                      <div key={extra.name} onClick={() => toggleExtra(extra)}
                        className="rounded-xl p-4 border-2 cursor-pointer transition-all"
                        style={{ background: isSelected ? "#1a0a00" : "#111", borderColor: isSelected ? "#C84B31" : "#333" }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-sm text-white">{extra.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{extra.description}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-black" style={{ color: "#C84B31" }}>+${extra.price}</span>
                            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs"
                              style={{ borderColor: isSelected ? "#C84B31" : "#555", background: isSelected ? "#C84B31" : "transparent" }}>
                              {isSelected ? "✓" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No extras available for this package.</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <button onClick={() => setStep(1)} className="px-8 py-3 rounded-full font-black text-sm border-2 border-gray-600 text-gray-300 hover:border-gray-400 transition">← Back</button>
            <button onClick={() => setStep(3)} className="px-10 py-3 rounded-full font-black text-white text-sm transition" style={{ background: "#C84B31" }}>
              Next: Review Summary →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Summary ── */}
      {step === 3 && selected && (
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-black text-white text-center mb-2" style={{ fontFamily: "Georgia,serif" }}>Your Package Summary</h3>
          <p className="text-gray-400 text-center mb-8">Review your selections before booking</p>

          <div className="rounded-2xl p-6 border border-gray-700 mb-6" style={{ background: "#1a1a1a" }}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Package</div>
                <div className="text-lg font-black text-white">{selected.name}</div>
                <div className="text-xs text-gray-400">Up to {selected.max_guests} guests · {eventType || "Event"}</div>
              </div>
              <div className="text-2xl font-black" style={{ color: "#C84B31" }}>${selected.base_price}</div>
            </div>

            {selectedExtras.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-700">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Extras</div>
                {selectedExtras.map(e => (
                  <div key={e.name} className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>✓ {e.name}</span><span>+${e.price}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4 pb-4 border-b border-gray-700">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Guests</div>
              <div className="text-white font-bold">{guestCount} guests</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400"><span>VAT 16%</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-black pt-2 border-t border-gray-700" style={{ color: "#C84B31" }}>
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => setStep(2)} className="px-8 py-3 rounded-full font-black text-sm border-2 border-gray-600 text-gray-300 hover:border-gray-400 transition">← Back</button>
            <button onClick={handleProceed}
              className="px-10 py-3 rounded-full font-black text-white text-sm transition hover:opacity-90"
              style={{ background: "#C84B31" }}>
              📅 Proceed to Book →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}