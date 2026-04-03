"use client";
import { useState, useEffect, useRef } from "react";

const SUGGESTED = ["Substitute for coconut milk?", "How to make pilau?", "Quick Kenyan snacks?"];

export default function AIChefChatbot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "👨‍🍳 Hi! I'm your AI Chef. Ask me anything about cooking, Kenyan cuisine, ingredient swaps, or recipes!" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const CREDIT_MESSAGES = [
    "🍳 Oops! Our AI Chef stepped out to restock the pantry. He'll be back once we top up the kitchen budget! Meanwhile, explore our recipe collection above.",
    "👨‍🍳 The AI Chef is on a quick coffee break — turns out even robots need chai sometimes! Check back soon or browse our recipes while you wait.",
    "🌶️ Our AI ran out of spices! The kitchen is temporarily closed for restocking. Browse our handpicked recipes in the meantime!",
    "🥘 The AI Chef is sharpening his knives and refilling his ingredients. He'll be cooking up answers again very soon!",
    "🍽️ Pole sana! (Sorry!) Our AI kitchen is temporarily closed. The chef is sourcing fresh ingredients — try our recipe browser above while we get back up!",
    "🔪 Even the best chefs need to restock! Our AI is temporarily offline but our full recipe collection is still hot and ready for you.",
  ];

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(p => [...p, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res  = await fetch("/api/ai-chef", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "chat", payload: { message: userMsg } }),
      });
      const data = await res.json();
      if (data.error === "credit_low" || data.error?.includes("credit") || data.error?.includes("billing")) {
        const msg = CREDIT_MESSAGES[Math.floor(Math.random() * CREDIT_MESSAGES.length)];
        setMessages(p => [...p, { role: "ai", text: msg }]);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setMessages(p => [...p, { role: "ai", text: data.reply || "No reply received." }]);
      }
    } catch (e) {
      setMessages(p => [...p, { role: "ai", text: `⚠️ ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-80 rounded-2xl shadow-2xl overflow-hidden border" style={{ background: "white", borderColor: "#E8E0D8" }}>
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#C84B31,#E07B54)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg">👨‍🍳</div>
              <div>
                <div className="text-sm font-black text-white">AI Chef</div>
                <div className="text-xs text-white opacity-80">● Online</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white font-bold text-lg hover:opacity-70">✕</button>
          </div>

          {/* Messages */}
          <div className="p-4 overflow-y-auto space-y-3" style={{ height: 300 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
                  style={{ background: m.role === "user" ? "#C84B31" : "#FFF3E0", color: m.role === "user" ? "white" : "#1A1A1A" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 text-sm animate-pulse" style={{ background: "#FFF3E0", color: "#1A1A1A" }}>
                  👨‍🍳 Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions */}
          <div className="px-4 pb-2 flex gap-1 flex-wrap">
            {SUGGESTED.map(q => (
              <button key={q} onClick={() => setInput(q)} className="text-xs px-2 py-1 rounded-full border"
                style={{ borderColor: "#C84B31", color: "#C84B31" }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2" style={{ borderColor: "#E8E0D8" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask me anything..." className="flex-1 rounded-full px-3 py-2 text-sm border focus:outline-none"
              style={{ borderColor: "#E8E0D8", color: "#1A1A1A" }} />
            <button onClick={send} disabled={loading} className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white disabled:opacity-60"
              style={{ background: "#C84B31" }}>→</button>
          </div>
        </div>
      )}

      {/* Bubble */}
      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-110"
        style={{ background: "linear-gradient(135deg,#C84B31,#E07B54)" }}>
        {open ? "✕" : "👨‍🍳"}
      </button>
    </div>
  );
}