import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getRecentActivity } from "../../../services/supabase/preferences";
import { getMovieDetails, getTVShowDetails } from "../../../services/tmdb/api";
import MediaCard from "./MediaCard";

const COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

export default function OverviewSection({
  movies,
  tv,
  watchlistMovies,
  watchlistTV,
  isLoading,
}) {
  const { activityMap, currentStreak, totalActiveDays } = useMemo(() => {
    const counts = {};
    [...movies, ...tv].forEach((item) => {
      const rawDate = item.userData?.watched_at || item.userData?.created_at;
      if (rawDate) {
        counts[rawDate.split("T")[0]] =
          (counts[rawDate.split("T")[0]] || 0) + 1;
      }
    });

    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (counts[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (
          streak === 0 &&
          checkDate.toDateString() === new Date().toDateString()
        ) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return {
      activityMap: counts,
      currentStreak: streak,
      totalActiveDays: Object.keys(counts).length,
    };
  }, [movies, tv]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white-100">
      {/* Top Hero Accent Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-black-200 to-black-200 border border-white/[0.06] p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white-100 via-white-200 to-white-300 bg-clip-text text-transparent">
              Activity Matrix
            </h2>
            <p className="text-sm text-white-300 mt-1">
              Your cinematic tracking footprint over the past year.
            </p>
          </div>
          <div className="flex gap-8 bg-black-300/50 backdrop-blur-md rounded-xl p-4 border border-white/[0.05]">
            <div>
              <p className="text-[10px] text-white-300 uppercase tracking-widest font-bold">
                Current Streak
              </p>
              <p className="text-2xl font-black text-purple-400 mt-0.5 flex items-center gap-1">
                🔥 {currentStreak}{" "}
                <span className="text-xs font-normal text-white-300">days</span>
              </p>
            </div>
            <div className="w-px bg-white/[0.08] self-stretch" />
            <div>
              <p className="text-[10px] text-white-300 uppercase tracking-widest font-bold">
                Total Days Active
              </p>
              <p className="text-2xl font-black text-blue-400 mt-0.5 flex items-center gap-1">
                ⚡ {totalActiveDays}{" "}
                <span className="text-xs font-normal text-white-300">days</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ActivityCalendar activityMap={activityMap} />
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Main Activity Feed (8 Columns) */}
        <div className="lg:col-span-8 space-y-8">
          <RecentActivitySection />
        </div>

        {/* Right Side: Sticky Analytics Sidebar (4 Columns) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <h3 className="text-lg font-bold tracking-wide uppercase text-white-300 text-xs">
            Analytics Pipeline
          </h3>

          <QuickStatsCard
            title="Movies"
            total={movies.length}
            hours={Math.round(
              movies.reduce((acc, m) => acc + (m.runtime || 0), 0) / 60,
            )}
            watchlist={watchlistMovies.length}
          />
          <QuickStatsCard
            title="TV Series"
            total={tv.length}
            hours={Math.round(
              tv.reduce(
                (acc, show) =>
                  acc +
                  (show.episode_run_time?.[0] ?? 30) *
                    (show.number_of_episodes ?? 10),
                0,
              ) / 60,
            )}
            watchlist={watchlistTV.length}
          />

          <MinimalChartBlock
            title="Movie Genres"
            data={useMemo(() => {
              const m = {};
              movies.forEach((i) =>
                i.genres?.forEach((g) => (m[g.name] = (m[g.name] || 0) + 1)),
              );
              return m;
            }, [movies])}
          />
          <MinimalChartBlock
            title="TV Genres"
            data={useMemo(() => {
              const m = {};
              tv.forEach((i) =>
                i.genres?.forEach((g) => (m[g.name] = (m[g.name] || 0) + 1)),
              );
              return m;
            }, [tv])}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------- SLEEK SUB COMPONENTS -------------------- */

function ActivityCalendar({ activityMap }) {
  const blocks = useMemo(() => {
    const list = [];
    const date = new Date();
    date.setDate(date.getDate() - 364);
    for (let i = 0; i < 364; i++) {
      const dateStr = date.toISOString().split("T")[0];
      list.push({ date: dateStr, count: activityMap[dateStr] || 0 });
      date.setDate(date.getDate() + 1);
    }
    return list;
  }, [activityMap]);

  return (
    <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/[0.1]">
      <div className="flex flex-col flex-wrap h-[97px] gap-[4px] w-max select-none">
        {blocks.map((b) => {
          let opacity = "bg-white/[0.04]";
          if (b.count === 1)
            opacity = "bg-purple-500/30 border border-purple-500/20";
          if (b.count === 2) opacity = "bg-purple-500/60";
          if (b.count >= 3)
            opacity = "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]";

          return (
            <div
              key={b.date}
              title={`${b.date}: ${b.count} logged`}
              className={`w-[10px] h-[10px] rounded-[1.5px] transition-all duration-300 hover:scale-125 hover:z-50 ${opacity}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function QuickStatsCard({ title, total, hours, watchlist }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-xl p-5 space-y-4">
      <h4 className="text-sm font-semibold text-white-200 tracking-wide">
        {title}
      </h4>
      <div className="grid grid-cols-3 text-center">
        <div>
          <div className="text-xl font-black">{total}</div>
          <div className="text-[10px] text-white-300 uppercase mt-0.5">
            Logged
          </div>
        </div>
        <div className="border-x border-white/[0.06]">
          <div className="text-xl font-black">{hours}h</div>
          <div className="text-[10px] text-white-300 uppercase mt-0.5">
            Time
          </div>
        </div>
        <div>
          <div className="text-xl font-black">{watchlist}</div>
          <div className="text-[10px] text-white-300 uppercase mt-0.5">
            Queue
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalChartBlock({ title, data }) {
  const chartData = useMemo(
    () =>
      Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [data],
  );
  if (!chartData.length) return null;

  return (
    <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-xl p-4">
      <h4 className="text-xs font-semibold text-white-300 tracking-wider uppercase mb-2">
        {title}
      </h4>
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={35}
              outerRadius={50}
              stroke="none"
              paddingAngle={4}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#121212",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{
                color: "#fff",
              }}
              itemStyle={{
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentActivitySection() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const navigate = useNavigate();

  const { data: recentMedia = [] } = useQuery({
    queryKey: ["recentActivity", userId],
    enabled: !!userId,
    queryFn: async () => {
      const activity = await getRecentActivity(userId, 8);
      const mediaData = await Promise.all(
        activity.map(async (item) => {
          if (item.media_type === "movie")
            return getMovieDetails(item.media_id);
          if (item.media_type === "tv") return getTVShowDetails(item.media_id);
          return null;
        }),
      );
      return mediaData.filter(Boolean);
    },
  });

  if (!recentMedia.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold tracking-tight text-white-200">
        Recent Discoveries
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentMedia.map((media) => (
          <div
            key={media.id}
            onClick={() =>
              navigate(
                media.title
                  ? `/media/movie/${media.id}`
                  : `/media/tv/${media.id}`,
              )
            }
            className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-black-200 border border-white/[0.05] transition-all duration-300 hover:scale-[1.03] hover:border-purple-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <img
              src={
                media.poster_path
                  ? `https://image.tmdb.org/t/p/w342${media.poster_path}`
                  : "/fallback.jpg"
              }
              alt=""
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black-300 via-black-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
              <p className="text-xs font-bold truncate">
                {media.title || media.name}
              </p>
              <p className="text-[10px] text-purple-400 font-medium mt-0.5">
                View Entries →
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
