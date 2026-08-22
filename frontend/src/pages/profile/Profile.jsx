import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layers, Film, Tv, Settings, UserCheck } from "react-feather";
import { useAuth } from "../../hooks/useAuth";

import ProfileHeader from "./components/ProfileHeader";
import OverviewSection from "./components/OverviewSection";
import MoviesSection from "./components/MoviesSection";
import TVShowsSection from "./components/TVShowsSection";
import SettingsSection from "./components/Settings";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

import { getMovieDetails, getTVShowDetails } from "../../services/tmdb/api";
import { supabase } from "../../services/supabase/client";

const enrichMedia = async (items, fetchDetailsFn) => {
  if (!items || items.length === 0) return [];
  const results = await Promise.all(
    items.map(async (item) => {
      try {
        const details = await fetchDetailsFn(item.media_id);
        return details ? { ...details, userData: item } : null;
      } catch (err) {
        console.error(`Error enriching media ID ${item.media_id}:`, err);
        return null;
      }
    }),
  );
  return results.filter(Boolean);
};

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const navigate = useNavigate();
  const [queryParams, setQueryParams] = useSearchParams();
  const activeTab = queryParams.get("category") || "Overview";

  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfileData", userId],
    enabled: !!userId,
    queryFn: async () => {
      // Single Supabase query to get all user preferences
      const { data: allPrefs = [], error: prefError } = await supabase
        .from("user_media_preferences")
        .select("*")
        .eq("user_id", userId);

      if (prefError) {
        console.error("Error loading user preferences:", prefError);
        throw prefError;
      }

      const watchedMovies = allPrefs.filter(
        (p) => (p.media_type === "movie" || !p.media_type) && p.watched,
      );
      const watchedTV = allPrefs.filter(
        (p) => p.media_type === "tv" && p.watched,
      );
      const rawWatchlistMovies = allPrefs.filter(
        (p) => (p.media_type === "movie" || !p.media_type) && p.watchlist,
      );
      const rawWatchlistTV = allPrefs.filter(
        (p) => p.media_type === "tv" && p.watchlist,
      );

      const [movies, tv, watchlistMovies, watchlistTV] = await Promise.all([
        enrichMedia(watchedMovies, getMovieDetails),
        enrichMedia(watchedTV, getTVShowDetails),
        enrichMedia(rawWatchlistMovies, getMovieDetails),
        enrichMedia(rawWatchlistTV, getTVShowDetails),
      ]);

      return { movies, tv, watchlistMovies, watchlistTV };
    },
    staleTime: 1000 * 60 * 5,
  });

  const movies = useMemo(() => profileData?.movies || [], [profileData]);
  const tv = useMemo(() => profileData?.tv || [], [profileData]);
  const watchlistMovies = useMemo(
    () => profileData?.watchlistMovies || [],
    [profileData],
  );
  const watchlistTV = useMemo(
    () => profileData?.watchlistTV || [],
    [profileData],
  );

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

  if (authLoading) {
    return <PageLoader message="Authenticating member profile..." />;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={UserCheck}
          title="Sign In to Access Your Dashboard"
          description="Create your cinematic profile, rate movies, track your watchlist, and unlock personalized insights."
          actionLabel="Sign In / Register"
          onAction={() => navigate("/signin")}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorState
          title="Unable to load profile data"
          message="We were unable to retrieve your tracked history and watchlists from the database."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

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
              className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-950/20"
                  : "text-white-300 hover:text-white-100 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <tab.Icon size={14} />
              <span>{tab.name}</span>
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
