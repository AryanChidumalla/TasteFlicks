import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails } from "../movieAPI";

export default function MoviesSection() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [genreCount, setGenreCount] = useState({});

  useEffect(() => {
    async function fetchMovies() {
      if (!userId) return;

      const [likedIds, dislikedIds, watchlistIds] = await Promise.all([
        getMediaByPreference(userId, "like", "movie"),
        getMediaByPreference(userId, "dislike", "movie"),
        getMediaByPreference(userId, "watchlist", "movie"),
      ]);

      const [likedData, dislikedData, watchlistData] = await Promise.all([
        Promise.all(likedIds.map(getMovieDetails)),
        Promise.all(dislikedIds.map(getMovieDetails)),
        Promise.all(watchlistIds.map(getMovieDetails)),
      ]);

      setLikedMovies(likedData);
      setDislikedMovies(dislikedData);
      setWatchlistMovies(watchlistData);

      // Calculate genre counts from liked movies only
      const genres = {};
      likedData.forEach((movie) => {
        movie.genres?.forEach((genre) => {
          genres[genre.name] = (genres[genre.name] || 0) + 1;
        });
      });
      setGenreCount(genres);
    }

    fetchMovies();
  }, [userId]);

  const renderSection = (title, movies) => (
    <div key={title}>
      <h2 className="text-2xl font-semibold text-white-100 mb-4">{title}</h2>
      {movies.length === 0 ? (
        <p className="text-white-300">No {title.toLowerCase()} movies yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-black-200 rounded p-3 hover:scale-105 transition-transform duration-200"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="rounded w-full mb-2"
              />
              <h3 className="text-white-100 font-semibold text-lg">
                {movie.title}
              </h3>
              <p className="text-white-300 text-sm">{movie.release_date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white-100 mb-6">
        Your Movies
      </h1>

      {Object.keys(genreCount).length > 0 && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl font-semibold text-white-100 mb-2">
            Genres Explored
          </h2>
          <div className="flex flex-wrap gap-2 max-w-full">
            {Object.entries(genreCount).map(([genre, count]) => (
              <span
                key={genre}
                className="bg-black-200 border border-black-300 text-white-100 px-3 py-1 rounded-full text-sm"
              >
                {genre}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {renderSection("Liked", likedMovies)}
        {renderSection("Disliked", dislikedMovies)}
        {renderSection("Watchlist", watchlistMovies)}
      </div>
    </section>
  );
}
