"use client";
export function Footer({ scrollTo, navLinks }) {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-10 px-4 text-center">
      <div className="text-2xl font-black text-yellow-400 mb-3">LuxeCatering</div>
      <div className="flex justify-center gap-6 text-sm text-gray-500 mb-4 flex-wrap">
        {navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(" ", "-"))} className="hover:text-yellow-400 transition">{l}</button>)}
      </div>
      <div className="flex justify-center gap-4 text-xl mb-4">
        {["📘","📸","🐦","▶️"].map((ic, x) => <span key={x} className="cursor-pointer hover:scale-125 transition-transform">{ic}</span>)}
      </div>
      <p className="text-xs text-gray-600">© 2026 LuxeCatering. Powered by Spoonacular + Claude AI + Supabase + YouTube.</p>
    </footer>
  );
}
