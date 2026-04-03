"use client";
import { useState }  from "react";
import { NAV_LINKS } from "@/data/static";
import AuthButton    from "@/components/auth/AuthButton";

export default function Navbar({ scrollTo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-40 bg-gray-950 bg-opacity-95 border-b border-yellow-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-2xl font-black text-yellow-400">LuxeCatering</div>
        <div className="hidden md:flex gap-6 text-sm font-semibold text-gray-300">
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(" ", "-"))}
              className="hover:text-yellow-400 transition">{l}</button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <a href="/portal" className="border border-yellow-500 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-950 transition">Track Booking</a>
          <AuthButton />
          <button className="bg-yellow-500 text-gray-950 px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-400 transition"
            onClick={() => scrollTo("booking")}>Book Now</button>
        </div>
        <button className="md:hidden text-yellow-400 text-2xl" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-gray-900 px-4 py-4 flex flex-col gap-3 text-sm">
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => { scrollTo(l.toLowerCase().replace(" ", "-")); setMenuOpen(false); }}
              className="text-left text-gray-300 hover:text-yellow-400">{l}</button>
          ))}
          <AuthButton />
        </div>
      )}
    </nav>
  );
}
