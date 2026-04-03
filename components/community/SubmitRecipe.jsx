"use client";
import { useState, useRef } from "react";

const CATEGORIES  = ["🇰🇪 Kenyan","Beef","Chicken","Vegetarian","Seafood","Dessert","Pasta","Breakfast","Other"];
const DIFFICULTIES = ["Easy","Medium","Hard"];

export default function SubmitRecipe() {
  const [form, setForm] = useState({
    name:"", description:"", category:"", cuisine:"", time:"",
    servings:"", difficulty:"Easy", ingredients:"", instructions:"",
    tags:"", submittedBy:"", email:"", isVegetarian:false, isVegan:false,
  });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");
  const [open,      setOpen]      = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.submittedBy || !form.email || !form.instructions) {
      setError("Please fill in all required fields (name, your name, email, instructions)");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "submit-recipe",
          data: {
            ...form,
            ingredients: form.ingredients.split("\n").map(i => i.trim()).filter(Boolean),
            tags:        form.tags.split(",").map(t => t.trim()).filter(Boolean),
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const inp = (field) => ({
    value:    form[field],
    onChange: e => setForm({ ...form, [field]: e.target.value }),
    className:"w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white",
    style:    { background:"#111", borderColor:"#333" },
  });

  return (
    <section id="submit-recipe" className="py-24 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:"#2D6A4F" }}>Community</div>
          <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily:"Georgia,serif" }}>
            Share Your <span style={{ color:"#2D6A4F" }}>Recipe</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Have a family recipe or a Kenyan dish you love? Share it with our community!
          </p>
        </div>

        {!open ? (
          <div className="text-center">
            <div className="rounded-2xl p-10 border border-gray-800 inline-block" style={{ background:"#1a1a1a" }}>
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-black text-white mb-2">Got a Recipe to Share?</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Submit your recipe and it will be reviewed by our team. Approved recipes appear on the community wall!
              </p>
              <button onClick={() => setOpen(true)}
                className="px-8 py-3 rounded-full font-black text-white transition hover:opacity-90"
                style={{ background:"#2D6A4F" }}>
                Submit a Recipe →
              </button>
            </div>
          </div>
        ) : submitted ? (
          <div className="text-center rounded-2xl p-10 border" style={{ background:"#0a1a0a", borderColor:"#2D6A4F" }}>
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-black text-white mb-2">Recipe Submitted!</h3>
            <p className="text-gray-400 mb-6">Thank you! Our team will review your recipe and publish it soon.</p>
            <button onClick={() => { setSubmitted(false); setOpen(false); setForm({ name:"",description:"",category:"",cuisine:"",time:"",servings:"",difficulty:"Easy",ingredients:"",instructions:"",tags:"",submittedBy:"",email:"",isVegetarian:false,isVegan:false }); }}
              className="px-6 py-2 rounded-full text-sm font-bold border border-gray-600 text-gray-300 hover:border-white hover:text-white transition">
              Submit Another
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-8 border border-gray-800" style={{ background:"#1a1a1a" }}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Recipe Name *</label>
                <input {...inp("name")} placeholder="e.g. Grandma's Pilau" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Cuisine</label>
                <input {...inp("cuisine")} placeholder="e.g. Kenyan, Swahili..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                  style={{ background:"#111", borderColor:"#333" }}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({...form,difficulty:e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                  style={{ background:"#111", borderColor:"#333" }}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Prep Time</label>
                <input {...inp("time")} placeholder="e.g. 45 mins" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Servings</label>
                <input {...inp("servings")} placeholder="e.g. 4 servings" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Description</label>
                <input {...inp("description")} placeholder="A short description of your recipe..." />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Ingredients * (one per line)</label>
                <textarea value={form.ingredients} onChange={e => setForm({...form,ingredients:e.target.value})}
                  rows={5} placeholder={"2 cups basmati rice\n500g goat meat\n1 tsp cumin\n..."}
                  className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white resize-none"
                  style={{ background:"#111", borderColor:"#333" }} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Instructions *</label>
                <textarea value={form.instructions} onChange={e => setForm({...form,instructions:e.target.value})}
                  rows={5} placeholder="Step by step instructions..."
                  className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white resize-none"
                  style={{ background:"#111", borderColor:"#333" }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Tags (comma separated)</label>
                <input {...inp("tags")} placeholder="kenyan, spicy, traditional..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Your Name *</label>
                <input {...inp("submittedBy")} placeholder="Your name" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Your Email *</label>
                <input type="email" {...inp("email")} placeholder="your@email.com" />
              </div>
              <div className="md:col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVegetarian} onChange={e => setForm({...form,isVegetarian:e.target.checked})} className="accent-green-500" />
                  <span className="text-sm text-gray-300">🌿 Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVegan} onChange={e => setForm({...form,isVegan:e.target.checked})} className="accent-green-500" />
                  <span className="text-sm text-gray-300">🌱 Vegan</span>
                </label>
              </div>
            </div>

            {error && <p className="text-xs mb-4" style={{ color:"#E53E3E" }}>{error}</p>}

            <div className="flex gap-4">
              <button onClick={() => setOpen(false)}
                className="px-6 py-3 rounded-full text-sm font-bold border border-gray-600 text-gray-400 hover:border-gray-400 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 rounded-full font-black text-white text-sm disabled:opacity-50 transition hover:opacity-90"
                style={{ background:"#2D6A4F" }}>
                {loading ? "⏳ Submitting..." : "Submit Recipe 🍽️"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}