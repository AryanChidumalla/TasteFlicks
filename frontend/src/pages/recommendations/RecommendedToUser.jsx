import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, RefreshCw } from "react-feather";
import { fetchCachedRecommendations } from "./recommendationCache";

export function RecommendedToUser({
  recommendations,
  error,
  isLoading,
  userId,
  onFeedUpdated,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const list = recommendations || [];

  // Manual bypass toggle event to force AI engine update re-calculations
  // inside RecommendedToUser.jsx
  const handleManualRefresh = async () => {
    if (!userId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      // 1. Force recalculation on the backend/Supabase database
      await fetchCachedRecommendations(userId, true);

      // 2. Alert TanStack Query to reload the new values into the UI state
      if (onFeedUpdated) {
        await onFeedUpdated();
      }
    } catch (err) {
      console.error("Failed executing inline force-refresh payload:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-sm font-semibold text-red-400 bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
          {error}
        </p>
      </div>
    );
  }

  const showSkeleton = isLoading || isRefreshing || !recommendations;

  if (!showSkeleton && list.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12 px-6 bg-gradient-to-br from-purple-950/15 via-white/[0.015] to-transparent border border-dashed border-purple-500/20 rounded-3xl space-y-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Star size={20} className="fill-purple-400/30" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white-100">
              Personalized Movie Recommendations
            </h3>
            <p className="text-xs sm:text-sm text-white-300 max-w-md mx-auto leading-relaxed">
              Rate or mark movies as watched to train your personal taste vector and unlock AI-powered recommendations.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md transition"
            >
              <span>Explore & Rate Movies</span>
            </Link>
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:text-white-100 transition"
            >
              <RefreshCw
                size={12}
                className={isRefreshing ? "animate-spin text-purple-400" : ""}
              />
              <span>Check for New Suggestions</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto flex flex-col px-4 sm:px-6 lg:px-8 py-6 gap-4">
      {/* Dynamic Header Block with Floating Action Trigger */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
          <div>
            <h2 className="text-white-100 text-lg sm:text-xl font-black tracking-tight">
              Recommended for You
            </h2>
            <p className="text-white-300 text-xs sm:text-sm">
              Curated films matching your unique vector taste profile.
            </p>
          </div>
        </div>

        {/* ⚡ Dynamic Refresh Pill Trigger */}
        {userId && (
          <button
            onClick={handleManualRefresh}
            disabled={showSkeleton}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white-300 bg-white/[0.02] hover:bg-purple-500/10 hover:text-purple-400 border border-white/[0.05] hover:border-purple-500/30 rounded-xl transition-all duration-300 disabled:opacity-40"
            title="Wipe cache database logs and force vector analysis recalculation"
          >
            <RefreshCw
              size={12}
              className={isRefreshing ? "animate-spin text-purple-400" : ""}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? "Re-Scoring..." : "Refresh Feed"}
            </span>
          </button>
        )}
      </div>

      {/* Horizontal Slider Layout Area */}
      <div className="flex space-x-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/[0.05] select-none">
        {showSkeleton
          ? [...Array(6)].map((_, i) => <SkeletonRecommendationCard key={i} />)
          : list.map((item) => (
              <Link
                key={item.id}
                to={`/media/movie/${item.id}`}
                className="group flex flex-col flex-shrink-0 w-[150px] sm:w-[180px] bg-white/[0.01] border border-white/[0.04] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-purple-500/30 hover:shadow-2xl"
              >
                {/* Poster Frame Wrapper */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black-300">
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                        : "/fallback.jpg"
                    }
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.adult && (
                    <span className="absolute top-2 right-2 bg-black-300/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide text-red-400 border border-red-500/20">
                      18+
                    </span>
                  )}
                </div>

                {/* Text Meta Fields */}
                <div className="p-3 space-y-1 bg-gradient-to-b from-transparent to-black-300 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold leading-snug truncate text-white-100 group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-white-300 font-medium mt-0.5">
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        <Star size={11} className="fill-current" />
                        <span className="font-bold ml-0.5">
                          {item?.vote_average
                            ? item.vote_average.toFixed(1)
                            : "NR"}
                        </span>
                      </div>
                      <span>•</span>
                      <span>
                        {item.release_date
                          ? item.release_date.split("-")[0]
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {item.genres && item.genres.length > 0 && (
                    <p className="text-[10px] text-purple-300/80 font-medium truncate pt-1 border-t border-white/[0.03]">
                      {item.genres
                        .slice(0, 2)
                        .map((g) => g.name)
                        .join(" • ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

export function SkeletonRecommendationCard() {
  return (
    <div className="w-[150px] sm:w-[180px] flex-shrink-0 aspect-[2/3] bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex flex-col justify-end space-y-2 animate-pulse">
      <div className="h-3.5 bg-white-300/20 rounded w-5/6" />
      <div className="h-2.5 bg-white-300/10 rounded w-1/2" />
    </div>
  );
}
