export function Pricing({ scrollTo, packages }) {
  return (
    <section id="pricing" className="py-24 px-4 bg-gray-950">
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-3">Transparent Pricing</div>
        <h2 className="text-4xl font-black mb-4 text-white">Choose Your <span className="text-yellow-400">Package</span></h2>
        <p className="text-gray-400 mb-14">Flexible plans for every occasion and budget</p>
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map(p => (
            <div key={p.name} className={`relative rounded-2xl p-8 border ${p.popular ? "border-yellow-400 bg-gray-800 scale-105 shadow-2xl shadow-yellow-900" : "border-gray-700 bg-gray-900"}`}>
              {p.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-gray-950 text-xs font-black px-4 py-1 rounded-full uppercase">Most Popular</div>}
              <div className={`text-4xl mb-2 bg-gradient-to-br ${p.color} bg-clip-text text-transparent font-black`}>{p.price}</div>
              <div className="text-xl font-bold mb-6 text-white">{p.name}</div>
              <ul className="text-sm text-gray-400 space-y-3 mb-8">{p.features.map(f => <li key={f} className="flex items-center gap-2"><span className="text-yellow-400">✓</span>{f}</li>)}</ul>
              <button onClick={() => scrollTo("contact")} className={`w-full py-3 rounded-full font-bold text-sm transition ${p.popular ? "bg-yellow-500 text-gray-950 hover:bg-yellow-400" : "border border-yellow-500 text-yellow-400 hover:bg-yellow-950"}`}>Get Started</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}