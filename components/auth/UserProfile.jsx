"use client";
import { useState, useEffect } from "react";
import { useAuth }             from "@/context/AuthContext";

const TABS = ["Profile","Bookmarks","Reviews","History","Preferences"];

export default function UserProfile({ onClose }) {
  const { user, profile, supabase, signOut, updateProfile } = useAuth();
  const [tab,        setTab]        = useState("Profile");
  const [bookmarks,  setBookmarks]  = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [formData,   setFormData]   = useState({ full_name:"", bio:"", location:"" });
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (profile) setFormData({ full_name: profile.full_name || "", bio: profile.bio || "", location: profile.location || "" });
  }, [profile]);

  useEffect(() => {
    if (tab === "Bookmarks") fetchBookmarks();
    if (tab === "Reviews")   fetchReviews();
    if (tab === "History")   fetchHistory();
  }, [tab]);

  const fetchBookmarks = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookmarks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setBookmarks(data || []);
    setLoading(false);
  };

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from("recipe_reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase.from("cooking_history").select("*").eq("user_id", user.id).order("cooked_at", { ascending: false });
    setHistory(data || []);
    setLoading(false);
  };

  const removeBookmark = async (id) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    setBookmarks(p => p.filter(b => b.id !== id));
  };

  const saveProfile = async () => {
    setSaving(true);
    await updateProfile(formData);
    setEditMode(false);
    setSaving(false);
  };

  const Stars = ({ n }) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? "#F59E0B" : "#333" }}>★</span>
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4"
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col"
        style={{ background:"#1a1a1a" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 flex items-center gap-4 border-b border-gray-800" style={{ background:"#111" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
            style={{ background:"linear-gradient(135deg,#C84B31,#E07B54)" }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
              : (profile?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-white text-lg truncate">{profile?.full_name || "User"}</h2>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {profile?.location && <p className="text-xs text-gray-500">📍 {profile.location}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={signOut}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 transition">
              Sign Out
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 overflow-x-auto" style={{ background:"#111" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-3 text-xs font-bold whitespace-nowrap transition border-b-2"
              style={{ color: tab===t ? "#C84B31" : "#666", borderColor: tab===t ? "#C84B31" : "transparent" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Profile Tab ── */}
          {tab === "Profile" && (
            <div>
              {!editMode ? (
                <div className="space-y-4">
                  {[
                    ["👤 Name",     profile?.full_name || "—"],
                    ["✉️ Email",    user?.email],
                    ["📍 Location", profile?.location || "—"],
                    ["📝 Bio",      profile?.bio || "—"],
                    ["📅 Joined",   new Date(user?.created_at).toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-sm text-white font-semibold">{value}</span>
                    </div>
                  ))}
                  <button onClick={() => setEditMode(true)}
                    className="w-full py-2.5 rounded-full text-sm font-black text-white mt-4 transition hover:opacity-90"
                    style={{ background:"#C84B31" }}>
                    ✏️ Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Full Name</label>
                    <input value={formData.full_name} onChange={e => setFormData({...formData, full_name:e.target.value})}
                      className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                      style={{ background:"#111", borderColor:"#333" }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Location</label>
                    <input value={formData.location} onChange={e => setFormData({...formData, location:e.target.value})}
                      placeholder="e.g. Nairobi, Kenya"
                      className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                      style={{ background:"#111", borderColor:"#333" }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wider">Bio</label>
                    <textarea value={formData.bio} onChange={e => setFormData({...formData, bio:e.target.value})}
                      rows={3} placeholder="Tell us about yourself..."
                      className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white resize-none"
                      style={{ background:"#111", borderColor:"#333" }} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditMode(false)}
                      className="flex-1 py-2.5 rounded-full text-sm font-bold border border-gray-600 text-gray-400 hover:border-gray-400 transition">
                      Cancel
                    </button>
                    <button onClick={saveProfile} disabled={saving}
                      className="flex-1 py-2.5 rounded-full text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50"
                      style={{ background:"#C84B31" }}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Bookmarks Tab ── */}
          {tab === "Bookmarks" && (
            <div>
              <h3 className="font-black text-white mb-4">❤️ Saved Recipes ({bookmarks.length})</h3>
              {loading ? (
                <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{background:"#333"}} />)}</div>
              ) : !bookmarks.length ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🔖</div>
                  <p className="text-gray-500 text-sm">No saved recipes yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Click the ❤️ on any recipe to save it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-800"
                      style={{ background:"#111" }}>
                      <div className="text-2xl">{b.recipe_data?.emoji || "🍽️"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">{b.recipe_name}</div>
                        <div className="text-xs text-gray-500">{b.source} · {new Date(b.created_at).toLocaleDateString()}</div>
                      </div>
                      <button onClick={() => removeBookmark(b.id)}
                        className="text-gray-500 hover:text-red-400 transition text-lg">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Reviews Tab ── */}
          {tab === "Reviews" && (
            <div>
              <h3 className="font-black text-white mb-4">⭐ My Reviews ({reviews.length})</h3>
              {loading ? (
                <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{background:"#333"}} />)}</div>
              ) : !reviews.length ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-gray-500 text-sm">No reviews yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Rate recipes after viewing them.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-xl border border-gray-800" style={{ background:"#111" }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-sm text-white">{r.recipe_name}</div>
                        <div className="text-sm"><Stars n={r.rating} /></div>
                      </div>
                      {r.review && <p className="text-xs text-gray-400 leading-relaxed">{r.review}</p>}
                      <p className="text-xs text-gray-600 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── History Tab ── */}
          {tab === "History" && (
            <div>
              <h3 className="font-black text-white mb-4">👨‍🍳 Cooking History ({history.length})</h3>
              {loading ? (
                <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{background:"#333"}} />)}</div>
              ) : !history.length ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">👨‍🍳</div>
                  <p className="text-gray-500 text-sm">No cooking history yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Mark recipes as cooked to track your history.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-800"
                      style={{ background:"#111" }}>
                      <div className="text-2xl">{h.recipe_data?.emoji || "🍽️"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">{h.recipe_name}</div>
                        <div className="text-xs text-gray-500">
                          Cooked on {new Date(h.cooked_at).toLocaleDateString()}
                          {h.rating && <span className="ml-2">{"★".repeat(h.rating)}</span>}
                        </div>
                        {h.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{h.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Preferences Tab ── */}
          {tab === "Preferences" && (
            <div>
              <h3 className="font-black text-white mb-4">⚙️ Preferences</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-800" style={{ background:"#111" }}>
                  <h4 className="text-sm font-black text-white mb-3">🥗 Dietary Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Vegetarian","Vegan","Gluten-Free","Halal","Dairy-Free","Nut-Free"].map(d => {
                      const prefs = profile?.preferences?.diet || [];
                      const active = prefs.includes(d);
                      return (
                        <button key={d} onClick={async () => {
                          const newDiet = active ? prefs.filter(x => x !== d) : [...prefs, d];
                          await updateProfile({ preferences: { ...profile?.preferences, diet: newDiet } });
                        }}
                          className="text-xs px-3 py-1.5 rounded-full font-bold border transition"
                          style={{ background: active ? "#2D6A4F" : "transparent", color: active ? "white" : "#666", borderColor: active ? "#2D6A4F" : "#444" }}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-gray-800" style={{ background:"#111" }}>
                  <h4 className="text-sm font-black text-white mb-3">🌍 Favourite Cuisines</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Kenyan","Swahili","Italian","Indian","Thai","American","Mediterranean"].map(c => {
                      const prefs = profile?.preferences?.cuisine || [];
                      const active = prefs.includes(c);
                      return (
                        <button key={c} onClick={async () => {
                          const newCuisine = active ? prefs.filter(x => x !== c) : [...prefs, c];
                          await updateProfile({ preferences: { ...profile?.preferences, cuisine: newCuisine } });
                        }}
                          className="text-xs px-3 py-1.5 rounded-full font-bold border transition"
                          style={{ background: active ? "#C84B31" : "transparent", color: active ? "white" : "#666", borderColor: active ? "#C84B31" : "#444" }}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}