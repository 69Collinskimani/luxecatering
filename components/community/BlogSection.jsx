"use client";
import { useState, useEffect } from "react";

const CATEGORIES = [
  { key:"all",            label:"All Stories"       },
  { key:"kenyan-cuisine", label:"🍽️ Kenyan Cuisine" },
  { key:"culture",        label:"🌍 Culture"         },
  { key:"recipes",        label:"📖 Recipes"         },
  { key:"tips",           label:"💡 Tips & Tech"     },
];

const UNSPLASH_KEY = "r9jIF_RSWQzIpLlDeJIa9EAkYbOf8TMY3xy3NS12B1w";
const imgCache     = {};

async function getBlogImage(title) {
  if (imgCache[title]) return imgCache[title];
  try {
    const res  = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(title + " kenya food")}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    const data = await res.json();
    const url  = data.results?.[0]?.urls?.regular || null;
    if (url) imgCache[title] = url;
    return url;
  } catch { return null; }
}

function BlogModal({ post, imgUrl, onClose }) {
  const paragraphs = post.content?.split("\n\n").filter(Boolean) || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4"
      onClick={onClose}>
      <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ background:"#FAF7F2" }} onClick={e => e.stopPropagation()}>
        {imgUrl && <img src={imgUrl} alt={post.title} className="w-full h-56 object-cover rounded-t-2xl" />}
        <div className="p-8">
          <button onClick={onClose} className="float-right text-gray-400 hover:text-gray-900 text-xl mb-2">✕</button>
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background:"#C84B31" }}>
              {CATEGORIES.find(c => c.key === post.category)?.label || post.category}
            </span>
            {post.trending && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background:"#F59E0B" }}>
                🔥 Trending
              </span>
            )}
            <span className="text-xs text-gray-500">{post.date}</span>
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ fontFamily:"Georgia,serif", color:"#1A1A1A" }}>{post.title}</h2>
          <p className="text-sm font-bold mb-6" style={{ color:"#C84B31" }}>By {post.author}</p>
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">{p}</p>
            ))}
          </div>
          {post.source_url && (
            <a href={post.source_url} target="_blank" rel="noreferrer"
              className="inline-block mt-4 text-xs font-bold" style={{ color:"#C84B31" }}>
              Read original source →
            </a>
          )}
          <div className="mt-4 flex gap-2 flex-wrap">
            {post.tags?.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background:"#FFF3E0", color:"#C84B31" }}>#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogSection() {
  const [posts,    setPosts]    = useState([]);
  const [images,   setImages]   = useState({});
  const [cat,      setCat]      = useState("all");
  const [selected, setSelected] = useState(null);
  const [selImg,   setSelImg]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [source,   setSource]   = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/food-news")
      .then(r => r.json())
      .then(async data => {
        setPosts(data.news || []);
        setSource(data.source);
        setLoading(false);
        // Fetch Unsplash images for each post
        data.news?.forEach(async p => {
          const url = await getBlogImage(p.title);
          if (url) setImages(prev => ({ ...prev, [p.id]: url }));
        });
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = cat === "all" ? posts : posts.filter(p => p.category === cat);

  const openPost = (post) => {
    setSelected(post);
    setSelImg(images[post.id] || null);
  };

  return (
    <section id="blog" className="py-24 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:"#C84B31" }}>
            🔥 Food Stories
          </div>
          <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily:"Georgia,serif" }}>
            Trending in <span style={{ color:"#C84B31" }}>Kenyan Food</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Latest news, stories and trends from Kenya's vibrant food industry
          </p>
          {source === "live" && (
            <div className="inline-block mt-3 text-xs px-3 py-1 rounded-full font-bold"
              style={{ background:"rgba(45,106,79,0.2)", color:"#2D6A4F" }}>
              ✅ Live News — Updated Today
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className="px-4 py-2 rounded-full text-xs font-bold transition border"
              style={{
                background:  cat === c.key ? "#C84B31" : "transparent",
                color:       cat === c.key ? "white" : "#888",
                borderColor: cat === c.key ? "#C84B31" : "#333",
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background:"#1a1a1a" }}>
                <div className="h-44" style={{ background:"#333" }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded" style={{ background:"#333" }} />
                  <div className="h-3 rounded w-3/4" style={{ background:"#333" }} />
                  <div className="h-3 rounded w-1/2" style={{ background:"#333" }} />
                </div>
              </div>
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-16 text-gray-500">No stories in this category yet.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Featured post */}
            {filtered[0] && (
              <div className="md:col-span-2 rounded-2xl overflow-hidden border border-gray-800 cursor-pointer group hover:border-gray-600 transition"
                style={{ background:"#1a1a1a" }} onClick={() => openPost(filtered[0])}>
                <div className="relative h-56 overflow-hidden">
                  {images[filtered[0].id]
                    ? <img src={images[filtered[0].id]} alt={filtered[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-6xl"
                        style={{ background:"linear-gradient(135deg,#1a0a00,#2a1200)" }}>🍽️</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background:"#C84B31" }}>
                      {CATEGORIES.find(c => c.key === filtered[0].category)?.label || filtered[0].category}
                    </span>
                    {filtered[0].trending && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background:"#F59E0B" }}>🔥 Trending</span>
                    )}
                  </div>
                  <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full text-gray-300"
                    style={{ background:"rgba(0,0,0,0.6)" }}>Featured</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-yellow-400 transition"
                    style={{ fontFamily:"Georgia,serif" }}>{filtered[0].title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{filtered[0].excerpt}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>By {filtered[0].author}</span>
                    <span>{filtered[0].date}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Side posts */}
            <div className="space-y-4">
              {filtered.slice(1, 4).map(post => (
                <div key={post.id} onClick={() => openPost(post)}
                  className="rounded-xl overflow-hidden border border-gray-800 cursor-pointer group hover:border-gray-600 transition flex"
                  style={{ background:"#1a1a1a" }}>
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden relative">
                    {images[post.id]
                      ? <img src={images[post.id]} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl"
                          style={{ background:"linear-gradient(135deg,#1a0a00,#2a1200)" }}>🍽️</div>}
                    {post.trending && (
                      <span className="absolute top-1 left-1 text-xs" title="Trending">🔥</span>
                    )}
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <h4 className="font-black text-xs text-white line-clamp-2 group-hover:text-yellow-400 transition mb-1"
                      style={{ fontFamily:"Georgia,serif" }}>{post.title}</h4>
                    <p className="text-xs text-gray-500">{post.author} · {post.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom row */}
            {filtered.slice(4).map(post => (
              <div key={post.id} onClick={() => openPost(post)}
                className="rounded-2xl overflow-hidden border border-gray-800 cursor-pointer group hover:border-gray-600 transition"
                style={{ background:"#1a1a1a" }}>
                <div className="relative h-36 overflow-hidden">
                  {images[post.id]
                    ? <img src={images[post.id]} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl"
                        style={{ background:"linear-gradient(135deg,#1a0a00,#2a1200)" }}>🍽️</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  {post.trending && (
                    <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                      style={{ background:"#F59E0B" }}>🔥 Trending</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-black text-sm text-white line-clamp-2 group-hover:text-yellow-400 transition"
                    style={{ fontFamily:"Georgia,serif" }}>{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <BlogModal post={selected} imgUrl={selImg} onClose={() => setSelected(null)} />}
    </section>
  );
}