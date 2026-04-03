"use client";
import { useState, useEffect } from "react";

const UNSPLASH_KEY  = "r9jIF_RSWQzIpLlDeJIa9EAkYbOf8TMY3xy3NS12B1w";
const SLIDE_QUERIES = [
  "luxury catering food spread",
  "kenyan nyama choma grilled meat",
  "elegant wedding reception dinner",
  "african cuisine pilau rice",
  "gourmet food plating restaurant",
  "kenyan food ugali sukuma",
];

export default function Hero({ scrollTo }) {
  const [images,  setImages]  = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded,  setLoaded]  = useState(false);

  // Fetch images from Unsplash
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const results = await Promise.all(
          SLIDE_QUERIES.map(q =>
            fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
              { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } })
              .then(r => r.json())
              .then(d => d.results?.[0]?.urls?.regular || null)
          )
        );
        setImages(results.filter(Boolean));
        setLoaded(true);
      } catch { setLoaded(true); }
    };
    fetchImages();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!images.length) return;
    const timer = setInterval(() => {
      setCurrent(p => (p + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center text-center px-4 pt-20 overflow-hidden">

      {/* ── Slideshow Background ── */}
      <div className="absolute inset-0 z-0">
        {loaded && images.length > 0 ? (
          <>
            {images.map((img, i) => (
              <div key={i} className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === current ? 1 : 0 }}>
                <img src={img} alt="food" className="w-full h-full object-cover" />
              </div>
            ))}
            {/* Dark overlay */}
            <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.85) 100%)" }} />
          </>
        ) : (
          /* Fallback gradient while loading */
          <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse at top,#3d1a00 0%,#0d0d0d 70%)" }} />
        )}
      </div>

      {/* ── Slide Indicators ── */}
      {images.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === current ? 24 : 8, height: 8, background: i === current ? "#C84B31" : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>
      )}

      {/* ── Prev / Next Arrows ── */}
      {images.length > 0 && (
        <>
          <button onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition hover:scale-110"
            style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.2)" }}>‹</button>
          <button onClick={() => setCurrent(p => (p + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition hover:scale-110"
            style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.2)" }}>›</button>
        </>
      )}

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-block bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-widest">
          Premium Catering Experience
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 text-white drop-shadow-lg">
          Elevate Every <span className="text-yellow-400">Moment</span><br />With Fine Food
        </h1>

        <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 drop-shadow">
          From intimate dinners to grand celebrations, we craft unforgettable culinary experiences tailored just for you.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <button onClick={() => scrollTo("booking")}
            className="bg-yellow-500 text-gray-950 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition shadow-lg shadow-yellow-900/50">
            Book Now
          </button>
          <button onClick={() => scrollTo("recipes")}
            className="border border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-gray-950 transition backdrop-blur-sm"
            style={{ background:"rgba(255,255,255,0.1)" }}>
            Explore Recipes
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-sm mx-auto">
          {[["500+","Events Catered"],["98%","Happy Clients"],["15+","Expert Chefs"]].map(([n,l]) => (
            <div key={l} className="text-center">
              <div className="text-3xl font-black text-yellow-400 drop-shadow">{n}</div>
              <div className="text-xs text-gray-300 mt-1">{l}</div>
            </div>
          ))}
        </div>

        {/* Current dish label */}
        {images.length > 0 && (
          <div className="mt-8 inline-block px-4 py-1.5 rounded-full text-xs text-white"
            style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.15)" }}>
            📸 {SLIDE_QUERIES[current]?.replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        )}
      </div>
    </section>
  );
}