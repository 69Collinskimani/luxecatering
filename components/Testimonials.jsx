"use client";
import { useState } from "react";
const Stars = ({ n }) => Array.from({ length: n }, (_, i) => <span key={i} className="text-yellow-400">★</span>);
export function Testimonials({ testimonials }) {
  return (
    <section id="testimonials" className="py-24 px-4 bg-gray-950">
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-3">What Clients Say</div>
        <h2 className="text-4xl font-black mb-14 text-white">Real <span className="text-yellow-400">Experiences</span></h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <div key={t.name} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-yellow-700 transition text-left">
              <div className="flex mb-4"><Stars n={t.stars} /></div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div><div className="font-bold text-yellow-400">{t.name}</div><div className="text-xs text-gray-500">{t.role}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
