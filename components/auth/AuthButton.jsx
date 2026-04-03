"use client";
import { useState }   from "react";
import { useAuth }    from "@/context/AuthContext";
import AuthModal      from "./AuthModal";
import UserProfile    from "./UserProfile";

export default function AuthButton() {
  const { user, profile, loading } = useAuth();
  const [showAuth,    setShowAuth]    = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (loading) return <div className="w-8 h-8 rounded-full animate-pulse bg-gray-700" />;

  if (user) return (
    <>
      <button onClick={() => setShowProfile(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-600 hover:border-yellow-500 transition">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white overflow-hidden"
          style={{ background:"linear-gradient(135deg,#C84B31,#E07B54)" }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            : (profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
        </div>
        <span className="text-xs font-bold text-gray-300 hidden sm:block max-w-20 truncate">
          {profile?.full_name?.split(" ")[0] || "Account"}
        </span>
      </button>
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  );

  return (
    <>
      <button onClick={() => setShowAuth(true)}
        className="px-4 py-2 rounded-full text-sm font-bold border border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition">
        Sign In
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}