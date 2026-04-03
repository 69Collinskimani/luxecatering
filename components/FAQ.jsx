"use client";
import { useState } from "react";
export function FAQ({ faqs }) {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="py-24 px-4 bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-3">Got Questions?</div>
          <h2 className="text-4xl font-black text-white">Frequently Asked <span className="text-yellow-400">Questions</span></h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 flex justify-between items-center font-semibold text-white hover:text-yellow-400 transition">
                <span>{f.q}</span><span className="text-yellow-400 text-xl">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
