import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails, getTVShowDetails } from "../movieAPI";

export default function OverviewSection() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [movieGenres, setMovieGenres] = useState({});
  const [tvGenres, setTVGenres] = useState({});
  const [movieStats, setMovieStats] = useState({});
  const [tvStats, setTVStats] = useState({});

  useEffect(() => {
    async function fetchOverviewData() {
      if (!userId) return;

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

      setMovieGenres(movieGenreMap);
      setMovieStats({
        total: watchedMovies.length,
        hoursWatched: Math.round(totalRuntimeMinutesForMovies / 60),
        likeCount: likedMovies.length,
        dislikeCount: dislikedMovies.length,
        watchlistCount: watchlistMovies.length,
      });

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

      setTVGenres(tvGenreMap);
      setTVStats({
        total: watchedTV.length,
        hoursWatched: Math.round(totalRuntimeMinutesForTVShows / 60),
        likeCount: likedTV.length,
        dislikeCount: dislikedTV.length,
        watchlistCount: watchlistTV.length,
      });
    }

    fetchOverviewData();
  }, [userId]);

  // Genre chips
  const renderGenres = (title, genreMap) => (
    <div>
      <h2 className="text-xl font-semibold text-white-100 mb-2">{title}</h2>
      {Object.keys(genreMap).length === 0 ? (
        <p className="text-white-300 mb-4">No genres explored yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-6 max-w-full">
          {Object.entries(genreMap).map(([genre, count]) => (
            <span
              key={genre}
              className="bg-black-200 border border-black-300 text-white-100 px-3 py-1 rounded-full text-sm"
            >
              {genre}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Stats summary box
  const renderStats = (stats) => {
    if (!stats || Object.keys(stats).length === 0) return null;

    return (
      <div className="bg-black-200 border border-black-300 text-white-100 p-5 rounded text-sm flex items-start justify-between flex-wrap gap-4">
        <div className="flex flex-col items-center min-w-[90px]">
          <div className="font-bold text-lg">{stats.total}</div>
          <div>Total Watched</div>
        </div>

        {stats.hoursWatched > 24 ? (
          <div className="flex flex-col items-center min-w-[90px]">
            <div className="font-bold text-lg">
              {Math.round(stats.hoursWatched / 24)}
            </div>
            <div>Days Watched</div>
          </div>
        ) : (
          <div className="flex flex-col items-center min-w-[90px]">
            <div className="font-bold text-lg">{stats.hoursWatched}</div>
            <div>Hours Watched</div>
          </div>
        )}

        <div className="flex flex-col items-center min-w-[90px]">
          <div className="font-bold text-lg">{stats.watchlistCount}</div>
          <div>In Watchlist</div>
        </div>
      </div>
    );
  };

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white-100 mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderGenres("Movies", movieGenres)}
        {renderGenres("TV Shows", tvGenres)}
        {renderStats(movieStats)}
        {renderStats(tvStats)}
      </div>
    </section>
  );
}
