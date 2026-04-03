"use client";
export function About() {
  return (
    <section className="py-24 px-4 bg-gray-900">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-3">Why Choose Us</div>
          <h2 className="text-4xl font-black mb-6 text-white">Culinary Art Meets <span className="text-yellow-400">Passion</span></h2>
          <p className="text-gray-400 leading-relaxed mb-6">We believe every meal is a story. Our team of world-class chefs blends bold flavors, fresh ingredients, and artistic presentation to create dining experiences that linger long after the last bite.</p>
          <div className="grid grid-cols-2 gap-4">
            {[["🌿","Fresh Ingredients"],["👨‍🍳","Expert Chefs"],["🎨","Custom Menus"],["⏱️","Always On Time"]].map(([e,t]) => (
              <div key={t} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3"><span className="text-2xl">{e}</span><span className="text-sm font-semibold text-gray-300">{t}</span></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {["🍷","🥘","🍰","🥗"].map((e,i) => <div key={i} className="bg-gray-800 rounded-2xl h-36 flex items-center justify-center text-6xl hover:scale-105 transition-transform">{e}</div>)}
        </div>
      </div>
    </section>
  );
}
