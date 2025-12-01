import React, { useEffect, useMemo, useState } from "react";
import ProfileHeader from "../ProfileComponent/ProfileHeader";
import { useDispatch, useSelector } from "react-redux";
import { Bookmark, Film, Layers, Settings, Tv } from "react-feather";
import { motion } from "framer-motion";
import OverviewSection from "../ProfileComponent/OverviewSection";
import Watchlist from "../ProfileComponent/Watchlist";
import MoviesSection from "../ProfileComponent/MoviesSection";
import TVShowsSection from "../ProfileComponent/TVShowsSection";
import RecentActivity from "../ProfileComponent/RecentActivity";
import StatsSection from "../ProfileComponent/StatsSection";
import { getMediaByPreference } from "../supabasePreferences";
import { setUserData } from "../redux/userSlice";
import { getMovieDetails, getTVShowDetails } from "../movieAPI";
import SettingsSection from "../ProfileComponent/Settings";
import { useSearchParams } from "react-router-dom";

// Refactored Profile component
// Goals:
//  - single source of truth for active tab (URL query param)
//  - simple, readable data-fetch flow with guards
//  - avoid unnecessary re-fetching
//  - defensive rendering so direct-linking (e.g. ?category=Watchlist) won't crash

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user.user);
  const userData = useSelector((s) => s.user.data || {});
  const userId = user?.id;

  const [queryParams, setQueryParams] = useSearchParams();
  const activeTab = queryParams.get("category") || "Overview"; // URL is source of truth

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // derived values with safe fallbacks
  const movieGenres = userData.movieGenres || {};
  const tvGenres = userData.tvGenres || {};
  const movieStats = userData.movieStats || null; // keep null to detect "not loaded"
  const tvStats = userData.tvStats || null;

  // Whether we already have computed stats in redux
  const isStatsLoaded = Boolean(movieStats && tvStats);

  // Hours watched memoized
  const hoursWatched = useMemo(() => {
    const m = movieStats?.hoursWatched ?? 0;
    const t = tvStats?.hoursWatched ?? 0;
    return m + t;
  }, [movieStats, tvStats]);

  // Clean, single fetch function. Keeps component-level logic simple.
  useEffect(() => {
    let cancelled = false;

    async function fetchOverviewData() {
      if (!userId) return; // wait for auth
      if (isStatsLoaded) return; // already have data

      setLoading(true);
      setError(null);

      try {
        // fetch ids
        const [
          likedMovieIds,
          dislikedMovieIds,
          watchlistMovieIds,
          likedTVIds,
          dislikedTVIds,
          watchlistTVIds,
        ] = await Promise.all([
          getMediaByPreference(userId, "like", "movie"),
          getMediaByPreference(userId, "dislike", "movie"),
          getMediaByPreference(userId, "watchlist", "movie"),
          getMediaByPreference(userId, "like", "tv"),
          getMediaByPreference(userId, "dislike", "tv"),
          getMediaByPreference(userId, "watchlist", "tv"),
        ]);

        // fetch details in parallel; guard empty arrays
        const safeMap = (arr, fn) =>
          Array.isArray(arr) && arr.length
            ? Promise.all(arr.map(fn))
            : Promise.resolve([]);

        const [
          likedMovies,
          dislikedMovies,
          watchlistMovies,
          likedTV,
          dislikedTV,
          watchlistTV,
        ] = await Promise.all([
          safeMap(likedMovieIds, getMovieDetails),
          safeMap(dislikedMovieIds, getMovieDetails),
          safeMap(watchlistMovieIds, getMovieDetails),
          safeMap(likedTVIds, getTVShowDetails),
          safeMap(dislikedTVIds, getTVShowDetails),
          safeMap(watchlistTVIds, getTVShowDetails),
        ]);

        // compute movie stats
        const watchedMovies = [...likedMovies, ...dislikedMovies];
        const movieGenreMap = {};
        let totalRuntimeMinutesForMovies = 0;

        watchedMovies.forEach((movie) => {
          (movie?.genres || []).forEach(
            (g) => (movieGenreMap[g.name] = (movieGenreMap[g.name] || 0) + 1)
          );
          totalRuntimeMinutesForMovies += movie?.runtime ?? 0;
        });

        const newMovieStats = {
          total: watchedMovies.length,
          hoursWatched: Math.round(totalRuntimeMinutesForMovies / 60),
          likeCount: likedMovies.length,
          dislikeCount: dislikedMovies.length,
          watchlistCount: watchlistMovies.length,
        };

        // compute tv stats
        const watchedTV = [...likedTV, ...dislikedTV];
        const tvGenreMap = {};
        let totalRuntimeMinutesForTVShows = 0;

        watchedTV.forEach((show) => {
          (show?.genres || []).forEach(
            (g) => (tvGenreMap[g.name] = (tvGenreMap[g.name] || 0) + 1)
          );
          const episodeLength = show?.episode_run_time?.[0] ?? 30;
          const episodeCount = show?.number_of_episodes ?? 0;
          totalRuntimeMinutesForTVShows += episodeLength * episodeCount;
        });

        const newTVStats = {
          total: watchedTV.length,
          hoursWatched: Math.round(totalRuntimeMinutesForTVShows / 60),
          likeCount: likedTV.length,
          dislikeCount: dislikedTV.length,
          watchlistCount: watchlistTV.length,
        };

        if (!cancelled) {
          // dispatch once with the computed values
          dispatch(
            setUserData({
              movieStats: newMovieStats,
              tvStats: newTVStats,
              movieGenres: movieGenreMap,
              tvGenres: tvGenreMap,
            })
          );
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load profile data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOverviewData();

    return () => {
      cancelled = true;
    };
  }, [userId, isStatsLoaded, dispatch]);

  // simple tab list
  const tabs = [
    { name: "Overview", Icon: Layers },
    { name: "Movies", Icon: Film },
    { name: "TV Shows", Icon: Tv },
    { name: "Watchlist", Icon: Bookmark },
    { name: "Settings", Icon: Settings },
  ];

  const onTabClick = (name) => {
    if (name === activeTab) return;
    setQueryParams({ category: name });
  };

  // Defensive rendering: wait for auth; show loading UI while we fetch stats
  if (!user) return <div className="p-4">Loading user...</div>;
  if (loading) return <div className="p-4">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-400">{error}</div>;

  return (
    <div>
      <ProfileHeader
        user={user}
        hoursWatched={hoursWatched}
        genreCount={{ ...movieGenres, ...tvGenres }}
      />

      <div className="flex flex-wrap gap-2 text-white-100 sm:gap-3 md:gap-5 relative border-b border-black-300 mb-6">
        {tabs.map((tab) => {
          const active = tab.name === activeTab;
          return (
            <button
              key={tab.name}
              onClick={() => onTabClick(tab.name)}
              className={`relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm sm:text-base md:text-base font-medium whitespace-nowrap ${
                active ? "text-primary-100" : ""
              }`}
            >
              <tab.Icon size={16} />
              {tab.name}

              {active && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-100"
                />
              )}
            </button>
          );
        })}
      </div>

      <main>
        {activeTab === "Overview" && (
          <>
            <OverviewSection />
            <StatsSection />
            <RecentActivity />
          </>
        )}

        {activeTab === "Movies" && <MoviesSection />}
        {activeTab === "TV Shows" && <TVShowsSection />}
        {activeTab === "Watchlist" && <Watchlist />}
        {activeTab === "Settings" && <SettingsSection />}
      </main>
    </div>
  );
}
