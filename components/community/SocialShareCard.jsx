"use client";
import { useState, useRef } from "react";

export default function SocialShareCard({ recipe, imageUrl }) {
  const [copied,    setCopied]    = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const cardRef = useRef(null);

  if (!recipe) return null;

  const shareText = `🍽️ ${recipe.name}\n\n⏱ ${recipe.time || "—"} | 👥 ${recipe.servings || "—"} | 📊 ${recipe.difficulty || "—"}\n\n🌍 ${recipe.cuisine || "Kenyan"} cuisine\n\nDiscover more recipes at LuxeCatering! 🇰🇪`;

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
  const shareTwitter  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(recipe.name)}`);

  const copyText = () => {
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Share Button */}
      <button onClick={() => setShareOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition">
        📤 Share
      </button>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4"
          onClick={() => setShareOpen(false)}>
          <div className="rounded-2xl max-w-sm w-full p-6 border border-gray-700"
            style={{ background:"#1a1a1a" }} onClick={e => e.stopPropagation()}>

            {/* Preview Card */}
            <div ref={cardRef} className="rounded-xl overflow-hidden mb-5" style={{ background:"linear-gradient(135deg,#1a0a00,#2a1200)", border:"1px solid #C84B31" }}>
              {imageUrl
                ? <img src={imageUrl} alt={recipe.name} className="w-full h-32 object-cover" />
                : <div className="h-32 flex items-center justify-center text-6xl">{recipe.emoji || "🍽️"}</div>}
              <div className="p-4">
                <div className="text-xs font-bold mb-1" style={{ color:"#C84B31" }}>🍽️ LuxeCatering</div>
                <h3 className="font-black text-white text-lg" style={{ fontFamily:"Georgia,serif" }}>{recipe.name}</h3>
                <div className="flex gap-2 mt-2 text-xs text-gray-400">
                  {recipe.time     && <span>⏱ {recipe.time}</span>}
                  {recipe.cuisine  && <span>🌍 {recipe.cuisine}</span>}
                  {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
                </div>
              </div>
            </div>

            <h3 className="font-black text-white mb-4 text-center">Share This Recipe</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={shareWhatsApp}
                className="py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background:"#25D366" }}>💬 WhatsApp</button>
              <button onClick={shareTwitter}
                className="py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background:"#1DA1F2" }}>🐦 Twitter</button>
              <button onClick={shareFacebook}
                className="py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background:"#1877F2" }}>📘 Facebook</button>
              <button onClick={copyText}
                className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background:"#FFF3E0", color:"#C84B31" }}>
                {copied ? "✅ Copied!" : "🔗 Copy Text"}
              </button>
            </div>

            <button onClick={() => setShareOpen(false)}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}