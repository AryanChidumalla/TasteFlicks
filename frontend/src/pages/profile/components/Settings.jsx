import React, { useState, useEffect } from "react";
import { User, Shield, LogOut, Trash2, Sliders, Check } from "react-feather";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";
import { toast } from "react-toastify";

export default function SettingsSection() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [defaultTab, setDefaultTab] = useState("Overview");

  useEffect(() => {
    if (user?.display_name) {
      setDisplayName(user.display_name);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile display name updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info("Signed out of your account.");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
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

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white-300 font-medium pl-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Enter your display name..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black-300/50 text-sm p-2.5 rounded-xl border border-white/[0.06] outline-none focus:border-purple-500/50 transition text-white-100 placeholder-white-300/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white-300 font-medium pl-1">
                Email Address (Read Only)
              </label>
              <input
                type="text"
                value={user?.email || ""}
                disabled
                className="w-full bg-white/[0.02] text-sm p-2.5 rounded-xl border border-white/[0.04] text-white-300/60 cursor-not-allowed"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-purple-900/20 disabled:opacity-50"
          >
            {isSaving ? "Updating Profile..." : "Save Profile Details"}
          </button>
        </form>
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
