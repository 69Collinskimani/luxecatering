"use client";
import { useState } from "react";
import { useAuth }  from "@/context/AuthContext";

export default function AuthModal({ onClose }) {
  const [mode,     setMode]     = useState("login"); // login | signup
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    if (mode === "login") {
      const { error } = await signInWithEmail(email, password);
      if (error) setError(error.message);
      else onClose?.();
    } else {
      if (!name) { setError("Please enter your name"); setLoading(false); return; }
      const { error } = await signUpWithEmail(email, password, name);
      if (error) setError(error.message);
      else setSuccess("Check your email to confirm your account!");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4"
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-md border border-gray-700 overflow-hidden"
        style={{ background:"#1a1a1a" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 text-center" style={{ background:"linear-gradient(135deg,#C84B31,#E07B54)" }}>
          <div className="text-4xl mb-2">🍽️</div>
          <h2 className="text-xl font-black text-white">
            {mode === "login" ? "Welcome Back!" : "Join LuxeCatering"}
          </h2>
          <p className="text-white text-opacity-80 text-sm mt-1">
            {mode === "login" ? "Sign in to access your account" : "Create your free account"}
          </p>
          <button onClick={onClose}
            className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100 text-xl font-bold">✕</button>
        </div>

        <div className="p-6">
          {/* Google Sign In */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-3 border border-gray-600 text-white hover:border-gray-400 transition mb-4 disabled:opacity-50"
            style={{ background:"#222" }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.5 39.3 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background:"#333" }} />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px" style={{ background:"#333" }} />
          </div>

          {/* Email Form */}
          <div className="space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
                style={{ background:"#111", borderColor:"#333" }} />
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
              style={{ background:"#111", borderColor:"#333" }} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Password"
              className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none text-white"
              style={{ background:"#111", borderColor:"#333" }} />
          </div>

          {error   && <p className="text-xs mt-3" style={{ color:"#E53E3E" }}>{error}</p>}
          {success && <p className="text-xs mt-3" style={{ color:"#2D6A4F" }}>{success}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 rounded-xl font-black text-white text-sm mt-4 disabled:opacity-50 transition hover:opacity-90"
            style={{ background:"#C84B31" }}>
            {loading ? "⏳ Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
              className="font-bold hover:underline" style={{ color:"#C84B31" }}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}