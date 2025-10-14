import { useEffect, useState } from "react";
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

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const userData = useSelector((state) => state.user.data);
  const userId = user?.id;

  const [loading, setLoading] = useState(false);
  const [profileSection, setProfileSection] = useState("Overview");

  const movieGenres = userData?.movieGenres || {};
  const tvGenres = userData?.tvGenres || {};
  const movieStats = userData?.movieStats || {};
  const tvStats = userData?.tvStats || {};

  useEffect(() => {
    async function fetchOverviewData() {
      if (!userId) return;

      // If we already have data in Redux, skip fetching
      if (userData?.movieStats && userData?.tvStats) return;

      setLoading(true);

      // Fetch media preference IDs in parallel
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

      // Fetch full media details in parallel
      const [
        likedMovies,
        dislikedMovies,
        watchlistMovies,
        likedTV,
        dislikedTV,
        watchlistTV,
      ] = await Promise.all([
        Promise.all(likedMovieIds.map(getMovieDetails)),
        Promise.all(dislikedMovieIds.map(getMovieDetails)),
        Promise.all(watchlistMovieIds.map(getMovieDetails)),
        Promise.all(likedTVIds.map(getTVShowDetails)),
        Promise.all(dislikedTVIds.map(getTVShowDetails)),
        Promise.all(watchlistTVIds.map(getTVShowDetails)),
      ]);

      // MOVIE STATS
      const watchedMovies = [...likedMovies, ...dislikedMovies];
      const movieGenreMap = {};
      let totalRuntimeMinutesForMovies = 0;

      watchedMovies.forEach((movie) => {
        movie.genres?.forEach((genre) => {
          movieGenreMap[genre.name] = (movieGenreMap[genre.name] || 0) + 1;
        });
        totalRuntimeMinutesForMovies += movie.runtime ?? 0;
      });

      const newMovieStats = {
        total: watchedMovies.length,
        hoursWatched: Math.round(totalRuntimeMinutesForMovies / 60),
        likeCount: likedMovies.length,
        dislikeCount: dislikedMovies.length,
        watchlistCount: watchlistMovies.length,
      };

      // TV STATS
      const watchedTV = [...likedTV, ...dislikedTV];
      const tvGenreMap = {};
      let totalRuntimeMinutesForTVShows = 0;

      watchedTV.forEach((show) => {
        show.genres?.forEach((genre) => {
          tvGenreMap[genre.name] = (tvGenreMap[genre.name] || 0) + 1;
        });

        const episodeLength = show.episode_run_time?.[0] ?? 30;
        const episodeCount = show.number_of_episodes || 0;
        totalRuntimeMinutesForTVShows += episodeLength * episodeCount;
      });

      const newTVStats = {
        total: watchedTV.length,
        hoursWatched: Math.round(totalRuntimeMinutesForTVShows / 60),
        likeCount: likedTV.length,
        dislikeCount: dislikedTV.length,
        watchlistCount: watchlistTV.length,
      };

      // Dispatch to Redux
      dispatch(
        setUserData({
          movieStats: newMovieStats,
          tvStats: newTVStats,
          movieGenres: movieGenreMap,
          tvGenres: tvGenreMap,
        })
      );

      setLoading(false);
    }

    fetchOverviewData();
  }, [userId]);

  const handleTabClick = (name) => {
    setProfileSection(name);
    localStorage.setItem("profileSection", name);
  };

  const tabs = [
    { name: "Overview", Icon: Layers },
    { name: "Movies", Icon: Film },
    { name: "TV Shows", Icon: Tv },
    { name: "Watchlist", Icon: Bookmark },
    { name: "Settings", Icon: Settings },
  ];

  return (
    <div>
      {/* ProfileHeader here */}
      <ProfileHeader
        user={user}
        hoursWatched={movieStats?.hoursWatched + tvStats?.hoursWatched || 0}
        genreCount={{ ...movieGenres, ...tvGenres }}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-white-100 sm:gap-3 md:gap-5 relative border-b border-black-300 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            className="relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm sm:text-base md:text-base font-medium whitespace-nowrap"
          >
            <tab.Icon size={16} />
            {tab.name}

            {/* Animated underline */}
            {profileSection === tab.name && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-100"
              />
            )}
          </button>
        ))}
      </div>

      {/* Sections */}
      <main>
        {profileSection === "Overview" && (
          <>
            <OverviewSection />
            <StatsSection />
            <RecentActivity />
          </>
        )}

        {profileSection === "Movies" && <MoviesSection />}
        {profileSection === "TV Shows" && <TVShowsSection />}
        {profileSection === "Watchlist" && <Watchlist />}
        {profileSection === "Settings" && <SettingsSection />}
      </main>
    </div>
  );
}
