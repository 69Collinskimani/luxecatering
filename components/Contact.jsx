"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CirclePlay,
  CheckCircle2,
  Clock3,
  Camera,
  Globe,
  Mail,
  MessageCircle,
  MapPin,
  Phone,
  Rocket,
} from "lucide-react";

const CONTACT_METHODS = [
  { Icon: Phone, label: "Call Us", value: "+254 700 000 000", href: "tel:+254700000000" },
  { Icon: Mail, label: "Email Us", value: "litetech598@gmail.com", href: "mailto:litetech598@gmail.com" },
  { Icon: MapPin, label: "Find Us", value: "Nairobi, Kenya", href: "https://maps.google.com/?q=Nairobi,Kenya" },
  { Icon: Clock3, label: "Working Hours", value: "Mon-Sat, 8am-8pm", href: null },
];

const SOCIAL_LINKS = [
  { Icon: Globe, name: "Facebook", href: "https://facebook.com" },
  { Icon: Camera, name: "Instagram", href: "https://instagram.com" },
  { Icon: MessageCircle, name: "Twitter", href: "https://twitter.com" },
  { Icon: CirclePlay, name: "YouTube", href: "https://youtube.com" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", date: "", package: "", guests: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, event_date: form.date || null, message: form.message }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      alert("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  const inputStyle = (field) => ({
    background: "#1a1a1a",
    borderColor: focused === field ? "#C84B31" : "#333",
  });

  return (
    <section id="contact" className="py-24 px-4 bg-gray-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none" style={{ background: "#C84B31" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none" style={{ background: "#2D6A4F" }} />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4" style={{ background: "rgba(200,75,49,0.15)", color: "#C84B31" }}>
            Get In Touch
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: "Georgia,serif" }}>
            Let&apos;s Make Your Event <span style={{ color: "#C84B31" }}>Unforgettable</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Ready to create a memorable culinary experience? Reach out and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_METHODS.map(({ Icon, label, value, href }) => (
              <div key={label} className="rounded-2xl p-5 border border-gray-800 hover:border-gray-600 transition group" style={{ background: "#111" }}>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: "rgba(200,75,49,0.15)" }}>
                      <Icon size={22} strokeWidth={2.1} style={{ color: "#C84B31" }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "#C84B31" }}>{label}</div>
                      <div className="text-white font-semibold text-sm group-hover:text-yellow-400 transition">{value}</div>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,75,49,0.15)" }}>
                      <Icon size={22} strokeWidth={2.1} style={{ color: "#C84B31" }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "#C84B31" }}>{label}</div>
                      <div className="text-white font-semibold text-sm">{value}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="rounded-2xl p-5 border border-gray-800" style={{ background: "#111" }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#C84B31" }}>Follow Us</div>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ Icon, name, href }) => (
                  <a key={name} href={href} target="_blank" rel="noreferrer" title={name} className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-700 hover:border-yellow-500 hover:scale-110 transition-all" style={{ background: "#1a1a1a" }}>
                    <Icon size={18} strokeWidth={2.1} className="text-gray-100" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "linear-gradient(135deg,#1a0a00,#2a1200)", borderColor: "#C84B31" }}>
              <div className="text-lg font-black text-white mb-1 inline-flex items-center gap-2">
                <CalendarDays size={18} strokeWidth={2.2} />
                Ready to Book?
              </div>
              <p className="text-xs text-gray-400 mb-4">Skip the form and go straight to our booking system</p>
              <a
                href="#booking"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-center py-2.5 rounded-full text-sm font-black text-white transition hover:opacity-90"
                style={{ background: "#C84B31" }}
              >
                <span className="inline-flex items-center gap-2">
                  Book Your Event
                  <ArrowRight size={16} strokeWidth={2.2} />
                </span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            {submitted ? (
              <div className="rounded-2xl p-10 flex flex-col items-center justify-center text-center border" style={{ background: "linear-gradient(135deg,#0a1a0a,#0d2010)", borderColor: "#2D6A4F", minHeight: 500 }}>
                <div className="mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(45,106,79,0.18)" }}>
                  <CheckCircle2 size={42} strokeWidth={2.2} style={{ color: "#9FE6B8" }} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "Georgia,serif" }}>Message Sent!</h3>
                <p className="text-gray-400 mb-2">Thank you, <strong className="text-white">{form.name}</strong>!</p>
                <p className="text-gray-400 text-sm mb-8">We&apos;ll reply to <strong className="text-white">{form.email}</strong> within 24 hours.</p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", date: "", package: "", guests: "", message: "" });
                  }}
                  className="px-8 py-3 rounded-full text-sm font-black border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-8 border border-gray-800" style={{ background: "#111" }}>
                <h3 className="text-xl font-black text-white mb-6" style={{ fontFamily: "Georgia,serif" }}>Send Us a Message</h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#888" }}>Full Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white transition-all border" style={inputStyle("name")} placeholder="John Mwangi" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#888" }}>Email Address *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white transition-all border" style={inputStyle("email")} placeholder="john@email.com" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#888" }}>Event Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} onFocus={() => setFocused("date")} onBlur={() => setFocused("")} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white transition-all border" style={{ ...inputStyle("date"), colorScheme: "dark" }} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#888" }}>Package Interest</label>
                    <select value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} onFocus={() => setFocused("package")} onBlur={() => setFocused("")} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white transition-all border" style={inputStyle("package")}>
                      <option value="">Select a package...</option>
                      <option value="Basic">Basic - $299</option>
                      <option value="Standard">Standard - $599</option>
                      <option value="Premium">Premium - $1,199</option>
                      <option value="Custom">Custom Package</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#888" }}>Expected Guests</label>
                    <input type="number" min="1" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} onFocus={() => setFocused("guests")} onBlur={() => setFocused("")} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white transition-all border" style={inputStyle("guests")} placeholder="e.g. 50" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#888" }}>Your Message</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} onFocus={() => setFocused("message")} onBlur={() => setFocused("")} rows={4} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white transition-all border resize-none" style={inputStyle("message")} placeholder="Tell us about your event, special requirements, or any questions..." />
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={submitting || !form.name || !form.email} className="w-full py-4 rounded-full font-black text-white text-sm disabled:opacity-40 transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#C84B31,#E07B54)" }}>
                  {submitting ? (
                    <>
                      <Clock3 size={16} strokeWidth={2.2} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Rocket size={16} strokeWidth={2.2} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-600 mt-4">We typically respond within <strong className="text-gray-500">2-4 hours</strong> during business hours</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
