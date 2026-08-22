import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Award, Clock } from "react-feather";

export default function ProfileHeader({
  user,
  hoursWatched = 0,
  genreCount = {},
}) {
  // Compute the top 3 genre tags for public tracking display
  const topGenres = useMemo(() => {
    return Object.entries(genreCount || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genreName]) => genreName);
  }, [genreCount]);

  if (!user) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/20 via-black-200 to-black-200 border border-white/[0.05] p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        {/* Avatar Identity Info Block */}
        <div className="flex items-center gap-5">
          <img
            src={
              user.avatar_url ||
              `https://www.gravatar.com/avatar/${user.email}?d=identicon`
            }
            alt="Profile Avatar"
            className="w-20 h-20 rounded-2xl object-cover border border-white/[0.08] shadow-2xl bg-black-300 flex-shrink-0"
          />

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white-100">
              Hi,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {user.display_name || "Cinephile"}
              </span>
            </h1>
            <p className="text-xs text-white-300 font-medium">
              Tracking cinema footprint since{" "}
              {user.created_at
                ? dayjs(user.created_at).format("MMM YYYY")
                : "2026"}
            </p>
          </div>
        </div>

        {/* Real-time Dynamic Stats Badges Container */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-black-300/40 backdrop-blur-md border border-white/[0.05] rounded-xl p-3 flex items-center gap-3 min-w-[120px]">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[10px] text-white-300 font-bold uppercase tracking-wider">
                Screen Time
              </p>
              <p className="text-sm font-black text-white-100">
                {hoursWatched}h
              </p>
            </div>
          </div>

          <div className="flex-1 sm:flex-none bg-black-300/40 backdrop-blur-md border border-white/[0.05] rounded-xl p-3 flex items-center gap-3 min-w-[160px]">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Award size={16} />
            </div>
            <div>
              <p className="text-[10px] text-white-300 font-bold uppercase tracking-wider">
                Primary DNA
              </p>
              <p className="text-xs font-black text-white-100 truncate max-w-[110px]">
                {topGenres.length ? topGenres.join(", ") : "Awaiting Logs"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
