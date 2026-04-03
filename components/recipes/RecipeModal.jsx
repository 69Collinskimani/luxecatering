"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock3,
  Copy,
  ExternalLink,
  Globe,
  Leaf,
  PlayCircle,
  Share2,
  Sparkles,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { YOUTUBE_KEY, videoCache } from "./RecipeUtils";
import RecipeActions from "@/components/auth/RecipeActions";

const META_ITEMS = [
  { key: "time", label: "Time", Icon: Clock3 },
  { key: "servings", label: "Serves", Icon: UtensilsCrossed },
  { key: "difficulty", label: "Level", Icon: ClipboardList },
  { key: "cuisine", label: "Cuisine", Icon: Globe },
];

export default function RecipeModal({ recipe, unsplashImage, onClose }) {
  const [videoId, setVideoId] = useState(null);
  const [aiDesc, setAiDesc] = useState("");
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [showNutrition, setShowNutrition] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getVideo = async () => {
      const key = recipe.name;
      if (videoCache[key]) {
        setVideoId(videoCache[key]);
        return;
      }
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(`${recipe.name} recipe how to cook`)}&type=video&maxResults=1&key=${YOUTUBE_KEY}`
        );
        const data = await res.json();
        const id = data.items?.[0]?.id?.videoId || null;
        if (id) {
          videoCache[key] = id;
          setVideoId(id);
        }
      } catch {}
    };

    const getAIDesc = async () => {
      if (!recipe.instructions) return;
      setLoadingAI(true);
      try {
        const res = await fetch("/api/ai-recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `enhance_description: ${recipe.instructions}`,
            category: "description",
          }),
        });
        const data = await res.json();
        if (typeof data === "string") setAiDesc(data);
        else if (Array.isArray(data) && data[0]?.description) setAiDesc(data[0].description);
      } catch {}
      setLoadingAI(false);
    };

    getVideo();
    getAIDesc();
  }, [recipe]);

  const toggleIngredient = (index) => {
    setCheckedIngredients((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const copyLink = () => {
    const url = window.location.href;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-2 py-4" onClick={onClose}>
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-yellow-700"
        style={{ background: "#FAF7F2", color: "#1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 w-full overflow-hidden rounded-t-2xl">
          {unsplashImage || recipe.image ? (
            <img
              src={unsplashImage || recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-8xl"
              style={{ background: "linear-gradient(135deg,#FFF3E0,#FAF7F2)" }}
            >
              {recipe.emoji}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close recipe"
            className="absolute top-3 right-3 bg-white text-gray-900 rounded-full w-9 h-9 flex items-center justify-center font-bold hover:bg-yellow-400 transition shadow-lg"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Georgia,serif" }}>
              {recipe.name}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {recipe.cuisine && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: "#C84B31" }}>
                  {recipe.cuisine}
                </span>
              )}
              {recipe.category && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: "#2D6A4F" }}>
                  {recipe.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-3 mb-6 text-center">
            {META_ITEMS.map(({ key, label, Icon }) => (
              <div key={label} className="rounded-xl p-2" style={{ background: "#FFF3E0" }}>
                <div className="flex justify-center mb-1">
                  <Icon size={18} strokeWidth={2.2} style={{ color: "#C84B31" }} />
                </div>
                <div className="text-xs font-black truncate" style={{ color: "#C84B31" }}>
                  {recipe[key] || "-"}
                </div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {recipe.isVegan && (
              <span className="text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5" style={{ background: "#D8F3DC", color: "#2D6A4F" }}>
                <Leaf size={14} strokeWidth={2.2} />
                Vegan
              </span>
            )}
            {recipe.isVegetarian && (
              <span className="text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5" style={{ background: "#D8F3DC", color: "#2D6A4F" }}>
                <Leaf size={14} strokeWidth={2.2} />
                Vegetarian
              </span>
            )}
            {recipe.tags?.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full font-bold capitalize" style={{ background: "#FFF3E0", color: "#C84B31" }}>
                #{tag}
              </span>
            ))}
          </div>

          <RecipeActions
            recipe={recipe}
            onAuthRequired={() => {
              onClose();
              document.getElementById("auth-trigger")?.click();
            }}
          />

          {videoId && (
            <div className="mb-6 mt-6">
              <h3 className="text-lg font-black mb-2 flex items-center gap-2" style={{ fontFamily: "Georgia,serif", color: "#C84B31" }}>
                <PlayCircle size={18} strokeWidth={2.2} />
                Watch: How to make {recipe.name}
              </h3>
              <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={recipe.name}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

          <div className="mb-6 p-4 rounded-xl" style={{ background: "#FFF8F0", borderLeft: "4px solid #C84B31" }}>
            <h3 className="text-lg font-black mb-2 flex items-center gap-2" style={{ fontFamily: "Georgia,serif", color: "#C84B31" }}>
              <Sparkles size={18} strokeWidth={2.2} />
              About This Recipe
            </h3>
            {loadingAI ? (
              <div className="animate-pulse h-4 rounded w-3/4" style={{ background: "#FFE0CC" }} />
            ) : (
              <p className="text-sm leading-relaxed text-gray-700">{aiDesc || recipe.instructions}</p>
            )}
          </div>

          {recipe.ingredients?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-black mb-3 flex items-center gap-2" style={{ fontFamily: "Georgia,serif", color: "#2D6A4F" }}>
                <UtensilsCrossed size={18} strokeWidth={2.2} />
                Ingredients
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <label key={index} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checkedIngredients[index]}
                      onChange={() => toggleIngredient(index)}
                      className="mt-0.5 accent-orange-500"
                    />
                    <span className={`text-xs leading-relaxed ${checkedIngredients[index] ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {ingredient}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {recipe.instructions && (
            <div className="mb-6">
              <h3 className="text-lg font-black mb-3 flex items-center gap-2" style={{ fontFamily: "Georgia,serif", color: "#2D6A4F" }}>
                <ClipboardList size={18} strokeWidth={2.2} />
                Instructions
              </h3>
              <div className="space-y-3">
                {recipe.instructions.split(/(?<=\.)\s+(?=[A-Z])/).map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                      style={{ background: "#C84B31" }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recipe.nutrition && (
            <div className="mb-6">
              <button
                onClick={() => setShowNutrition(!showNutrition)}
                className="w-full flex justify-between items-center p-3 rounded-xl font-bold text-sm"
                style={{ background: "#FFF3E0", color: "#C84B31" }}
              >
                <span className="inline-flex items-center gap-2">
                  <ClipboardList size={16} strokeWidth={2.2} />
                  Nutrition Facts
                </span>
                {showNutrition ? <ChevronUp size={18} strokeWidth={2.4} /> : <ChevronDown size={18} strokeWidth={2.4} />}
              </button>
              {showNutrition && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {Object.entries(recipe.nutrition).map(([key, value]) => (
                    <div key={key} className="text-center p-2 rounded-lg" style={{ background: "#F0FFF4" }}>
                      <div className="text-xs font-black" style={{ color: "#2D6A4F" }}>
                        {value}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4" style={{ borderColor: "#E8E0D8" }}>
            <h3 className="text-sm font-black mb-3 text-gray-600 flex items-center gap-2" style={{ fontFamily: "Georgia,serif" }}>
              <Share2 size={16} strokeWidth={2.2} />
              Share This Recipe
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`https://wa.me/?text=Check out this recipe: ${recipe.name}`)}
                className="flex-1 py-2 rounded-full text-sm font-bold text-white inline-flex items-center justify-center gap-2"
                style={{ background: "#25D366" }}
              >
                <Users size={16} strokeWidth={2.2} />
                WhatsApp
              </button>
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=Making ${recipe.name} tonight!`)}
                className="flex-1 py-2 rounded-full text-sm font-bold text-white inline-flex items-center justify-center gap-2"
                style={{ background: "#1DA1F2" }}
              >
                <Share2 size={16} strokeWidth={2.2} />
                Twitter
              </button>
              <button
                onClick={copyLink}
                className="flex-1 py-2 rounded-full text-sm font-bold inline-flex items-center justify-center gap-2"
                style={{ background: "#FFF3E0", color: "#C84B31" }}
              >
                {copied ? <CheckCircle2 size={16} strokeWidth={2.2} /> : <Copy size={16} strokeWidth={2.2} />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 text-center py-2 rounded-full font-bold text-sm text-white"
              style={{ background: "#C84B31" }}
            >
              View Full Recipe
              <ExternalLink size={16} strokeWidth={2.2} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
