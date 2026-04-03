"use client";
import { useState, useEffect } from "react";

const STATUS_COLORS  = { pending:"#F59E0B", confirmed:"#2D6A4F", cancelled:"#E53E3E", completed:"#3B82F6" };
const PAYMENT_COLORS = { unpaid:"#E53E3E", partial:"#F59E0B", paid:"#2D6A4F" };
const TABS           = ["Overview","Bookings","Invoices","Analytics","Calendar"];
const ADMIN_PIN      = "1234";

export default function AdminDashboard() {
  const [data,         setData]         = useState(null);
  const [analytics,    setAnalytics]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("Overview");
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("all");
  const [selected,     setSelected]     = useState(null);
  const [updating,     setUpdating]     = useState(false);
  const [pin,          setPin]          = useState("");
  const [authed,       setAuthed]       = useState(false);
  const [analyticsDay, setAnalyticsDay] = useState(30);
  const [exporting,    setExporting]    = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchAnalytics = async (days = 30) => {
    try {
      const res  = await fetch(`/api/analytics?days=${days}`);
      const json = await res.json();
      setAnalytics(json);
    } catch (e) { console.error(e); }
  };

  const exportData = async (type) => {
    setExporting(type);
    try {
      const res  = await fetch(`/api/admin/export?type=${type}&days=${analyticsDay}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert("Export failed: " + e.message); }
    setExporting("");
  };

  useEffect(() => {
    if (authed) { fetchData(); fetchAnalytics(30); }
  }, [authed]);

  const updateBooking = async (id, updates) => {
    setUpdating(true);
    try {
      const res  = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      await fetchData();
      setSelected(prev => prev ? { ...prev, ...updates } : null);
    } catch (e) {
      console.error("update error:", e);
      alert(`Update failed: ${e.message}`);
    }
    setUpdating(false);
  };

  const filtered = data?.bookings?.filter(b => {
    const matchSearch = !search ||
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_ref?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || b.status === filter;
    return matchSearch && matchFilter;
  });

  // ── PIN Gate ──────────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
      <div className="rounded-2xl p-10 text-center border border-gray-700 w-80" style={{ background: "#1a1a1a" }}>
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-black text-white mb-2">Admin Access</h2>
        <p className="text-gray-400 text-sm mb-6">Enter your PIN to continue</p>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (pin === ADMIN_PIN ? setAuthed(true) : setPin(""))}
          placeholder="Enter PIN" maxLength={4}
          className="w-full text-center text-2xl tracking-widest rounded-xl px-4 py-3 border focus:outline-none text-white mb-4"
          style={{ background: "#111", borderColor: "#333", letterSpacing: "0.5em" }} />
        <button onClick={() => pin === ADMIN_PIN ? setAuthed(true) : setPin("")}
          className="w-full py-3 rounded-full font-black text-white text-sm"
          style={{ background: "#C84B31" }}>Enter Dashboard</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-4">🍽️</div>
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  const { stats, bookings, invoices, monthlyRevenue, packageCount } = data || {};

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d", color: "white" }}>

      {/* ── Nav ── */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40"
        style={{ background: "#0d0d0d" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <div className="font-black text-white">LuxeCatering</div>
            <div className="text-xs text-gray-500">Admin Dashboard</div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-full text-xs font-bold transition"
              style={{ background: tab === t ? "#C84B31" : "#1a1a1a", color: tab === t ? "white" : "#888" }}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="text-xs text-gray-400 hover:text-white transition">↻ Refresh</button>
          <button onClick={() => setAuthed(false)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">

        {/* ── OVERVIEW TAB ── */}
        {tab === "Overview" && (
          <div>
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily: "Georgia,serif" }}>Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                ["Total Bookings", stats?.total,       "#C84B31", "📋"],
                ["Confirmed",      stats?.confirmed,   "#2D6A4F", "✅"],
                ["Pending",        stats?.pending,     "#F59E0B", "⏳"],
                ["Revenue",       `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`, "#3B82F6", "💰"],
              ].map(([label, value, color, icon]) => (
                <div key={label} className="rounded-2xl p-5 border border-gray-800" style={{ background: "#1a1a1a" }}>
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-2xl font-black" style={{ color }}>{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                ["Cancelled",       stats?.cancelled,  "#E53E3E", "❌"],
                ["Completed",       stats?.completed,  "#8B5CF6", "🎉"],
                ["Pending Revenue", `$${stats?.pendingRevenue?.toFixed(2) || "0.00"}`, "#F59E0B", "⏳"],
                ["Total Events",    stats?.total,      "#C84B31", "📅"],
              ].map(([label, value, color, icon]) => (
                <div key={label} className="rounded-2xl p-5 border border-gray-800" style={{ background: "#1a1a1a" }}>
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-2xl font-black" style={{ color }}>{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#C84B31" }}>📈 Monthly Revenue</h3>
                {!Object.keys(monthlyRevenue || {}).length
                  ? <p className="text-gray-500 text-sm">No revenue data yet</p>
                  : Object.entries(monthlyRevenue).sort().slice(-6).map(([month, amount]) => (
                    <div key={month} className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{month}</span><span>${amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "#333" }}>
                        <div className="h-2 rounded-full" style={{ background: "#C84B31", width: `${Math.min((amount / (stats?.totalRevenue || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#2D6A4F" }}>📦 Package Popularity</h3>
                {!Object.keys(packageCount || {}).length
                  ? <p className="text-gray-500 text-sm">No bookings yet</p>
                  : Object.entries(packageCount).map(([pkg, count]) => (
                    <div key={pkg} className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{pkg}</span><span>{count} bookings</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "#333" }}>
                        <div className="h-2 rounded-full" style={{ background: "#2D6A4F", width: `${(count / (stats?.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === "Bookings" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <h2 className="text-2xl font-black" style={{ fontFamily: "Georgia,serif" }}>All Bookings</h2>
              <div className="flex gap-3 flex-wrap">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, ref..."
                  className="rounded-full px-4 py-2 text-sm border focus:outline-none text-white"
                  style={{ background: "#1a1a1a", borderColor: "#333", minWidth: 220 }} />
                <select value={filter} onChange={e => setFilter(e.target.value)}
                  className="rounded-full px-4 py-2 text-sm border focus:outline-none text-white"
                  style={{ background: "#1a1a1a", borderColor: "#333" }}>
                  {["all","pending","confirmed","cancelled","completed"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button onClick={() => exportData("bookings")} disabled={!!exporting}
                  className="px-4 py-2 rounded-full text-xs font-bold border border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition disabled:opacity-40">
                  {exporting === "bookings" ? "⏳" : "⬇️ Export CSV"}
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-800 overflow-hidden" style={{ background: "#1a1a1a" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#111" }}>
                    {["Ref","Customer","Event Date","Package","Guests","Total","Status","Payment","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!filtered?.length && (
                    <tr><td colSpan={9} className="text-center py-12 text-gray-500">No bookings found</td></tr>
                  )}
                  {filtered?.map(b => (
                    <tr key={b.id} className="border-t border-gray-800 hover:bg-gray-900 transition">
                      <td className="px-4 py-3 font-bold text-xs" style={{ color: "#C84B31" }}>{b.booking_ref}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white text-xs">{b.customer_name}</div>
                        <div className="text-gray-500 text-xs">{b.customer_email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">{b.event_date}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">{b.package_name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">{b.guest_count}</td>
                      <td className="px-4 py-3 text-xs font-bold text-white">${(b.total_amount * 1.16).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white capitalize"
                          style={{ background: STATUS_COLORS[b.status] || "#666" }}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white capitalize"
                          style={{ background: PAYMENT_COLORS[b.payment_status] || "#666" }}>{b.payment_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(b)}
                          className="text-xs px-3 py-1 rounded-full font-bold text-white"
                          style={{ background: "#333" }}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INVOICES TAB ── */}
        {tab === "Invoices" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black" style={{ fontFamily: "Georgia,serif" }}>Invoices</h2>
              <button onClick={() => exportData("invoices")} disabled={!!exporting}
                className="px-4 py-2 rounded-full text-xs font-bold border border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition disabled:opacity-40">
                {exporting === "invoices" ? "⏳ Exporting..." : "⬇️ Export CSV"}
              </button>
            </div>
            <div className="rounded-2xl border border-gray-800 overflow-hidden" style={{ background: "#1a1a1a" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#111" }}>
                    {["Invoice #","Customer","Amount","VAT","Total","Status","Due Date","Paid At"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!invoices?.length && (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-500">No invoices yet</td></tr>
                  )}
                  {invoices?.map(inv => (
                    <tr key={inv.id} className="border-t border-gray-800 hover:bg-gray-900 transition">
                      <td className="px-4 py-3 font-bold text-xs" style={{ color: "#C84B31" }}>{inv.invoice_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white text-xs">{inv.customer_name}</div>
                        <div className="text-gray-500 text-xs">{inv.customer_email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">${inv.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">${inv.tax_amount?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-bold text-white">${inv.total_amount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white capitalize"
                          style={{ background: PAYMENT_COLORS[inv.status] || "#666" }}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">{inv.due_date || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "Analytics" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <h2 className="text-2xl font-black" style={{ fontFamily: "Georgia,serif" }}>Analytics</h2>
              <div className="flex gap-3 flex-wrap items-center">
                <select value={analyticsDay}
                  onChange={e => { setAnalyticsDay(Number(e.target.value)); fetchAnalytics(Number(e.target.value)); }}
                  className="rounded-full px-4 py-2 text-sm border focus:outline-none text-white"
                  style={{ background: "#1a1a1a", borderColor: "#333" }}>
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                {[["bookings","📋 Bookings"],["invoices","🧾 Invoices"],["recipe_views","🍽️ Views"],["searches","🔍 Searches"]].map(([type, label]) => (
                  <button key={type} onClick={() => exportData(type)} disabled={!!exporting}
                    className="px-4 py-2 rounded-full text-xs font-bold border border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition disabled:opacity-40">
                    {exporting === type ? "⏳" : `⬇️ ${label}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                ["👁️ Recipe Views",  analytics?.summary?.totalViews    || 0,    "#C84B31"],
                ["🔍 Searches",      analytics?.summary?.totalSearches || 0,    "#F59E0B"],
                ["📋 Bookings",      analytics?.summary?.totalBookings || 0,    "#2D6A4F"],
                ["💰 Revenue",      `$${(analytics?.summary?.totalRevenue || 0).toFixed(2)}`, "#3B82F6"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-2xl p-5 border border-gray-800" style={{ background: "#1a1a1a" }}>
                  <div className="text-xs text-gray-500 mb-2">{label}</div>
                  <div className="text-2xl font-black" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">

              {/* Top Recipes */}
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#C84B31" }}>🍽️ Most Viewed Recipes</h3>
                {!analytics?.topRecipes?.length
                  ? <p className="text-gray-500 text-sm">No data yet — views appear as users browse</p>
                  : analytics.topRecipes.map((r, i) => (
                    <div key={r.name} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300 flex items-center gap-2">
                          <span className="text-gray-500">#{i + 1}</span>{r.name}
                        </span>
                        <span className="font-bold" style={{ color: "#C84B31" }}>{r.count} views</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#333" }}>
                        <div className="h-1.5 rounded-full" style={{ background: "#C84B31", width: `${(r.count / (analytics.topRecipes[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Top Searches */}
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#F59E0B" }}>🔍 Most Searched Terms</h3>
                {!analytics?.topSearches?.length
                  ? <p className="text-gray-500 text-sm">No searches yet</p>
                  : analytics.topSearches.map((s, i) => (
                    <div key={s.query} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300 flex items-center gap-2">
                          <span className="text-gray-500">#{i + 1}</span>
                          <span className="capitalize">{s.query}</span>
                        </span>
                        <span className="font-bold" style={{ color: "#F59E0B" }}>{s.count}x</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#333" }}>
                        <div className="h-1.5 rounded-full" style={{ background: "#F59E0B", width: `${(s.count / (analytics.topSearches[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Top Cuisines */}
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#2D6A4F" }}>🌍 Popular Cuisines</h3>
                {!analytics?.topCuisines?.length
                  ? <p className="text-gray-500 text-sm">No data yet</p>
                  : analytics.topCuisines.map((c) => (
                    <div key={c.cuisine} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{c.cuisine}</span>
                        <span className="font-bold" style={{ color: "#2D6A4F" }}>{c.count} views</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#333" }}>
                        <div className="h-1.5 rounded-full" style={{ background: "#2D6A4F", width: `${(c.count / (analytics.topCuisines[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Source Breakdown */}
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#8B5CF6" }}>📊 Recipe Source Breakdown</h3>
                {!analytics?.sourceCount
                  ? <p className="text-gray-500 text-sm">No data yet</p>
                  : Object.entries(analytics.sourceCount).map(([src, count]) => {
                    const colors = { spoonacular:"#C84B31", mealdb:"#F59E0B", local:"#2D6A4F", ai:"#8B5CF6" };
                    const total  = Object.values(analytics.sourceCount).reduce((a, b) => a + b, 0) || 1;
                    return (
                      <div key={src} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300 capitalize">{src === "mealdb" ? "TheMealDB" : src}</span>
                          <span className="font-bold" style={{ color: colors[src] }}>{count} ({Math.round(count / total * 100)}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "#333" }}>
                          <div className="h-1.5 rounded-full" style={{ background: colors[src] || "#666", width: `${(count / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="rounded-2xl p-6 border border-gray-800 mb-6" style={{ background: "#1a1a1a" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black" style={{ color: "#3B82F6" }}>💰 Monthly Revenue Trend</h3>
                <button onClick={() => exportData("invoices")} disabled={!!exporting}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition">
                  ⬇️ Export
                </button>
              </div>
              {!Object.keys(analytics?.monthlyRevenue || {}).length
                ? <p className="text-gray-500 text-sm">No paid invoices yet</p>
                : (
                  <div className="flex items-end gap-3 h-40">
                    {Object.entries(analytics.monthlyRevenue).sort().slice(-6).map(([month, amount]) => {
                      const max = Math.max(...Object.values(analytics.monthlyRevenue));
                      const pct = (amount / max) * 100;
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-bold" style={{ color: "#3B82F6" }}>${amount.toFixed(0)}</span>
                          <div className="w-full rounded-t-lg" style={{ background: "#3B82F6", height: `${pct}%`, minHeight: 4 }} />
                          <span className="text-xs text-gray-500">{month.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* Daily Booking Trend */}
            <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black" style={{ color: "#2D6A4F" }}>📅 Daily Booking Trend</h3>
                <button onClick={() => exportData("bookings")} disabled={!!exporting}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400 transition">
                  ⬇️ Export
                </button>
              </div>
              {!Object.keys(analytics?.dailyBookings || {}).length
                ? <p className="text-gray-500 text-sm">No bookings in this period</p>
                : (
                  <div className="flex items-end gap-1 h-24 overflow-x-auto">
                    {Object.entries(analytics.dailyBookings).sort().map(([day, count]) => {
                      const max = Math.max(...Object.values(analytics.dailyBookings));
                      return (
                        <div key={day} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: 28 }}>
                          <div className="w-5 rounded-t" style={{ background: "#2D6A4F", height: `${(count / max) * 80}px`, minHeight: 4 }} />
                          <span className="text-gray-600" style={{ fontSize: 9 }}>{day.slice(8)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {tab === "Calendar" && (
          <div>
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily: "Georgia,serif" }}>Booking Calendar</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#C84B31" }}>📅 Upcoming Events</h3>
                {bookings?.filter(b => new Date(b.event_date) >= new Date() && b.status !== "cancelled")
                  .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                  .slice(0, 8)
                  .map(b => (
                    <div key={b.id} onClick={() => setSelected(b)}
                      className="flex items-center gap-3 p-3 rounded-xl mb-2 border border-gray-800 hover:border-gray-600 transition cursor-pointer"
                      style={{ background: "#111" }}>
                      <div className="text-center rounded-lg p-2 min-w-12" style={{ background: "#C84B31" }}>
                        <div className="text-xs text-white font-bold">{new Date(b.event_date).toLocaleDateString("en", { month: "short" })}</div>
                        <div className="text-lg font-black text-white leading-none">{new Date(b.event_date).getDate()}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">{b.customer_name}</div>
                        <div className="text-xs text-gray-500">{b.package_name} · {b.guest_count} guests</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white capitalize flex-shrink-0"
                        style={{ background: STATUS_COLORS[b.status] || "#666" }}>{b.status}</span>
                    </div>
                  ))}
              </div>
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "#1a1a1a" }}>
                <h3 className="font-black mb-4" style={{ color: "#2D6A4F" }}>🕐 Recent Activity</h3>
                {bookings?.slice(0, 8).map(b => (
                  <div key={b.id} className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: STATUS_COLORS[b.status] || "#333" }}>
                      {b.status === "confirmed" ? "✓" : b.status === "cancelled" ? "✗" : "⏳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{b.customer_name} — {b.package_name}</div>
                      <div className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs font-bold flex-shrink-0" style={{ color: "#C84B31" }}>${(b.total_amount * 1.16).toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4" onClick={() => setSelected(null)}>
          <div className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700 p-6"
            style={{ background: "#1a1a1a" }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-white">{selected.customer_name}</h3>
                <p className="text-xs text-gray-400">{selected.booking_ref}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-2 text-sm mb-6">
              {[
                ["Email",      selected.customer_email],
                ["Phone",      selected.customer_phone || "—"],
                ["Event Date", selected.event_date],
                ["Event Type", selected.event_type || "—"],
                ["Package",    selected.package_name],
                ["Guests",     selected.guest_count],
                ["Venue",      selected.venue || "—"],
                ["Total",     `$${(selected.total_amount * 1.16).toFixed(2)}`],
                ["Notes",      selected.notes || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Update Booking Status</p>
              <div className="flex gap-2 flex-wrap">
                {["pending","confirmed","cancelled","completed"].map(s => (
                  <button key={s} disabled={updating || selected.status === s}
                    onClick={() => updateBooking(selected.id, { status: s })}
                    className="px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-40 capitalize transition"
                    style={{ background: STATUS_COLORS[s] || "#333" }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Update Payment Status</p>
              <div className="flex gap-2 flex-wrap">
                {["unpaid","partial","paid"].map(s => (
                  <button key={s} disabled={updating || selected.payment_status === s}
                    onClick={() => updateBooking(selected.id, { payment_status: s })}
                    className="px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-40 capitalize transition"
                    style={{ background: PAYMENT_COLORS[s] || "#333" }}>{s}</button>
                ))}
              </div>
            </div>
            {updating && <p className="text-xs text-yellow-400 mt-3 text-center">Updating...</p>}
          </div>
        </div>
      )}
    </div>
  );
}