"use client";
import { useState, useEffect } from "react";

const CHEF_IMAGES = [
  "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583394293214-61a2b49d0eb8?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop",
];

export default function ChefProfiles() {
  const [chefs,    setChefs]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/community?type=chefs")
      .then(r => r.json())
      .then(data => { setChefs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="chefs" className="py-24 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:"#C84B31" }}>Meet The Team</div>
          <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily:"Georgia,serif" }}>
            Our <span style={{ color:"#C84B31" }}>Expert Chefs</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            World-class culinary talent with deep roots in Kenyan cuisine and global flavors
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background:"#1a1a1a" }}>
                <div className="h-64" style={{ background:"#333" }} />
                <div className="p-6 space-y-3">
                  <div className="h-5 rounded" style={{ background:"#333" }} />
                  <div className="h-3 rounded w-2/3" style={{ background:"#333" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {chefs.map((chef, i) => (
              <div key={chef.id} onClick={() => setSelected(chef)}
                className="rounded-2xl overflow-hidden border border-gray-800 cursor-pointer group hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"
                style={{ background:"#1a1a1a" }}>
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={chef.image_url || CHEF_IMAGES[i % CHEF_IMAGES.length]}
                    alt={chef.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => { e.currentTarget.src = CHEF_IMAGES[i % CHEF_IMAGES.length]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-black text-white text-lg" style={{ fontFamily:"Georgia,serif" }}>{chef.name}</h3>
                    <p className="text-xs font-bold" style={{ color:"#C84B31" }}>{chef.title}</p>
                  </div>
                  {/* Experience badge */}
                  <div className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-black text-white"
                    style={{ background:"rgba(200,75,49,0.9)" }}>
                    {chef.years_exp}+ yrs
                  </div>
                </div>
                {/* Info */}
                <div className="p-5">
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{chef.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {chef.specialties?.slice(0, 3).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background:"rgba(200,75,49,0.15)", color:"#C84B31" }}>{s}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">🌍 {chef.nationality}</span>
                    <span className="text-xs font-bold" style={{ color:"#C84B31" }}>View Profile →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chef Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4"
          onClick={() => setSelected(null)}>
          <div className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            style={{ background:"#1a1a1a" }} onClick={e => e.stopPropagation()}>
            <div className="relative h-56">
              <img src={selected.image_url || CHEF_IMAGES[0]} alt={selected.name}
                className="w-full h-full object-cover rounded-t-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-t-2xl" />
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black bg-opacity-60 text-white flex items-center justify-center font-bold hover:bg-opacity-90 transition">✕</button>
              <div className="absolute bottom-4 left-4">
                <h2 className="text-2xl font-black text-white" style={{ fontFamily:"Georgia,serif" }}>{selected.name}</h2>
                <p className="text-sm font-bold" style={{ color:"#C84B31" }}>{selected.title}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-4 text-sm">
                <div className="text-center"><div className="font-black text-white">{selected.years_exp}+</div><div className="text-xs text-gray-500">Years Exp</div></div>
                <div className="text-center"><div className="font-black text-white">{selected.specialties?.length}</div><div className="text-xs text-gray-500">Specialties</div></div>
                <div className="text-center"><div className="font-black text-white">{selected.nationality}</div><div className="text-xs text-gray-500">Nationality</div></div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">{selected.bio}</p>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color:"#C84B31" }}>Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.specialties?.map(s => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background:"rgba(200,75,49,0.15)", color:"#C84B31" }}>{s}</span>
                  ))}
                </div>
              </div>
              {selected.instagram && (
                <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold" style={{ color:"#C84B31" }}>
                  📸 @{selected.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}