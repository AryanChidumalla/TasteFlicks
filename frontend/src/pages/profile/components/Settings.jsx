import React, { useState } from "react";
import { User, Shield, LogOut, Trash2, Sliders } from "react-feather";
import { supabase } from "../../../services/supabase/client";
import { useNavigate } from "react-router-dom";

export default function SettingsSection() {
  const navigate = useNavigate();

  // UI States for local preference control examples
  const [username, setUsername] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [defaultTab, setDefaultTab] = useState("Overview");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-white-100">
      {/* 1. PROFILE SECTION */}
      <section className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 text-white-200">
          <User size={18} className="text-purple-400" />
          <h3 className="text-lg font-bold">Profile Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white-300 font-medium pl-1">
              Display Name
            </label>
            <input
              type="text"
              placeholder="Update username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black-300/50 text-sm p-2.5 rounded-xl border border-white/[0.06] outline-none focus:border-purple-500/50 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white-300 font-medium pl-1">
              Cinematic Bio
            </label>
            <input
              type="text"
              placeholder="Tell others what you love watching..."
              className="w-full bg-black-300/50 text-sm p-2.5 rounded-xl border border-white/[0.06] outline-none focus:border-purple-500/50 transition"
            />
          </div>
        </div>
        <button className="text-xs bg-purple-600 hover:bg-purple-500 font-semibold px-4 py-2 rounded-xl transition">
          Save Changes
        </button>
      </section>

      {/* 2. PREFERENCES SECTION */}
      <section className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 text-white-200">
          <Sliders size={18} className="text-blue-400" />
          <h3 className="text-lg font-bold">Preferences</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <h4 className="text-sm font-medium">Default Landing Tab</h4>
            <p className="text-xs text-white-300">
              Choose which tab opens first when viewing your profile.
            </p>
          </div>
          <select
            value={defaultTab}
            onChange={(e) => setDefaultTab(e.target.value)}
            className="bg-black-300/50 text-xs p-2.5 rounded-xl border border-white/[0.06] text-white-100 outline-none w-40"
          >
            <option value="Overview">Overview</option>
            <option value="Movies">Movies</option>
            <option value="TV Shows">TV Shows</option>
          </select>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="text-sm font-medium">Private Watchlist</h4>
            <p className="text-xs text-white-300">
              Hide your historical watch logs from being publicly accessible.
            </p>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 accent-purple-500 cursor-pointer"
          />
        </div>
      </section>

      {/* 3. ACCOUNT DANGER ZONE */}
      <section className="bg-red-950/10 border border-red-500/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-red-500/10 pb-3 text-red-200">
          <Shield size={18} />
          <h3 className="text-lg font-bold">Account Security & Actions</h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white-200">
              Session Termination
            </h4>
            <p className="text-xs text-white-300">
              Sign safely out of your current browser session.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] px-4 py-2.5 rounded-xl transition"
          >
            <LogOut size={14} />
            <span>Log Out Account</span>
          </button>
        </div>

        <div className="h-px bg-red-500/10" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-red-400">
              Purge Profiling Data
            </h4>
            <p className="text-xs text-white-300">
              Permanently eliminate your account, credentials, and tracked items
              database.
            </p>
          </div>
          <button className="flex items-center gap-2 text-xs font-semibold bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-400 px-4 py-2.5 rounded-xl transition">
            <Trash2 size={14} />
            <span>Delete Entire Account</span>
          </button>
        </div>
      </section>
    </div>
  );
}
