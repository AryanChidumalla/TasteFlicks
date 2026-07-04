import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Layers, Film, Tv, Settings } from "react-feather";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

import ProfileHeader from "./components/ProfileHeader";
import OverviewSection from "./components/OverviewSection";
import MoviesSection from "./components/MoviesSection";
import TVShowsSection from "./components/TVShowsSection";
import SettingsSection from "./components/Settings";

import { getMovieDetails, getTVShowDetails } from "../../services/tmdb/api";
import {
  getUserMediaByFilter,
  getUserWatchListMedia,
} from "../../services/supabase/profileApi";

const enrichMedia = async (items, fetchDetailsFn) => {
  if (!items) return [];
  return Promise.all(
    items.map(async (item) => {
      try {
        const details = await fetchDetailsFn(item.media_id);
        return { ...details, userData: item };
      } catch (err) {
        console.error(`Error enriching media ID ${item.media_id}:`, err);
        return null;
      }
    }),
  ).then((results) => results.filter(Boolean));
};

export default function Profile() {
  const user = useSelector((s) => s.user.user);
  const userId = user?.id;

  const [queryParams, setQueryParams] = useSearchParams();
  const activeTab = queryParams.get("category") || "Overview";

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfileData", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [watchedMovies, watchedTV, rawWatchlistMovies, rawWatchlistTV] =
        await Promise.all([
          getUserMediaByFilter(userId, "movie"),
          getUserMediaByFilter(userId, "tv"),
          getUserWatchListMedia(userId, "movie"),
          getUserWatchListMedia(userId, "tv"),
        ]);

      const [movies, tv, watchlistMovies, watchlistTV] = await Promise.all([
        enrichMedia(watchedMovies, getMovieDetails),
        enrichMedia(watchedTV, getTVShowDetails),
        enrichMedia(rawWatchlistMovies, getMovieDetails),
        enrichMedia(rawWatchlistTV, getTVShowDetails),
      ]);

      return { movies, tv, watchlistMovies, watchlistTV };
    },
  });

  const movies = profileData?.movies || [];
  const tv = profileData?.tv || [];
  const watchlistMovies = profileData?.watchlistMovies || [];
  const watchlistTV = profileData?.watchlistTV || [];

  // 📊 Compute stats dynamically for the Header Context
  const profileMetrics = useMemo(() => {
    if (!profileData) return { hoursWatched: 0, genreMap: {} };

    const movieMinutes = movies.reduce((acc, m) => acc + (m.runtime || 0), 0);
    const tvMinutes = tv.reduce((acc, show) => {
      const runtime = show.episode_run_time?.[0] ?? 30;
      const episodes = show.number_of_episodes ?? 10;
      return acc + runtime * episodes;
    }, 0);

    const genreMap = {};
    [...movies, ...tv].forEach((item) => {
      item.genres?.forEach((g) => {
        genreMap[g.name] = (genreMap[g.name] || 0) + 1;
      });
    });

    return {
      hoursWatched: Math.round((movieMinutes + tvMinutes) / 60),
      genreMap,
    };
  }, [profileData, movies, tv]);

  const tabs = [
    { name: "Overview", Icon: Layers },
    { name: "Movies", Icon: Film },
    { name: "TV Shows", Icon: Tv },
    { name: "Settings", Icon: Settings },
  ];

  if (!user)
    return (
      <div className="p-8 text-white-300">
        Resolving authorization session...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-400 font-semibold">
        Error retrieving profiling database profiles.
      </div>
    );

  const onTabClick = (name) => {
    if (name === activeTab) return;
    setQueryParams({ category: name });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white-100">
      {/* 👤 Profile Identity Jumbotron Banner */}
      <ProfileHeader
        user={user}
        hoursWatched={profileMetrics.hoursWatched}
        genreCount={profileMetrics.genreMap}
      />

      {/* 🎯 Tab Navigation Glass Pill Bar */}
      <nav className="flex flex-wrap gap-2 bg-white/[0.01] border border-white/[0.04] p-1.5 rounded-2xl w-max max-w-full">
        {tabs.map((tab) => {
          const active = tab.name === activeTab;
          return (
            <button
              key={tab.name}
              onClick={() => onTabClick(tab.name)}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition ${
                active
                  ? "text-purple-400"
                  : "text-white-300 hover:text-white-100"
              }`}
            >
              <tab.Icon size={14} />
              <span>{tab.name}</span>

              {active && (
                <motion.div
                  layoutId="activeProfileTabGlow"
                  className="absolute inset-0 bg-purple-500/10 border border-purple-500/20 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main View Shell Container */}
      <main className="pt-2">
        {activeTab === "Overview" && (
          <OverviewSection
            movies={movies}
            tv={tv}
            watchlistMovies={watchlistMovies}
            watchlistTV={watchlistTV}
            isLoading={isLoading}
          />
        )}

        {activeTab === "Movies" && (
          <MoviesSection
            movies={movies}
            watchlistMovies={watchlistMovies}
            isLoading={isLoading}
          />
        )}

        {activeTab === "TV Shows" && (
          <TVShowsSection
            tv={tv}
            watchlistTV={watchlistTV}
            isLoading={isLoading}
          />
        )}

        {activeTab === "Settings" && <SettingsSection />}
      </main>
    </div>
  );
}
