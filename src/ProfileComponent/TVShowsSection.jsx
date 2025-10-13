import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getMediaByPreference } from "../supabasePreferences";
import { getTVShowDetails } from "../movieAPI";

export default function TVShowsSection() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [likedTVShows, setLikedTVShows] = useState([]);
  const [dislikedTVShows, setDislikedTVShows] = useState([]);
  const [watchlistTVShows, setWatchlistTVShows] = useState([]);
  const [genreCount, setGenreCount] = useState({});

  useEffect(() => {
    async function fetchTVShows() {
      if (!userId) return;

      const [likedIds, dislikedIds, watchlistIds] = await Promise.all([
        getMediaByPreference(userId, "like", "tv"),
        getMediaByPreference(userId, "dislike", "tv"),
        getMediaByPreference(userId, "watchlist", "tv"),
      ]);

      const [likedData, dislikedData, watchlistData] = await Promise.all([
        Promise.all(likedIds.map(getTVShowDetails)),
        Promise.all(dislikedIds.map(getTVShowDetails)),
        Promise.all(watchlistIds.map(getTVShowDetails)),
      ]);

      setLikedTVShows(likedData);
      setDislikedTVShows(dislikedData);
      setWatchlistTVShows(watchlistData);

      // Calculate genre counts from liked TV shows only
      const genres = {};
      likedData.forEach((show) => {
        show.genres?.forEach((genre) => {
          genres[genre.name] = (genres[genre.name] || 0) + 1;
        });
      });
      setGenreCount(genres);
    }

    fetchTVShows();
  }, [userId]);

  const renderSection = (title, tvShows) => (
    <div key={title}>
      <h2 className="text-2xl font-semibold text-white-100 mb-4">{title}</h2>
      {tvShows.length === 0 ? (
        <p className="text-white-300">No {title.toLowerCase()} TV shows yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {tvShows.map((show) => (
            <div
              key={show.id}
              className="bg-black-200 rounded p-3 hover:scale-105 transition-transform duration-200"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                alt={show.name}
                className="rounded w-full mb-2"
              />
              <h3 className="text-white-100 font-semibold text-lg">
                {show.name}
              </h3>
              <p className="text-white-300 text-sm">{show.first_air_date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white-100 mb-6">
        Your TV Shows
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
        {renderSection("Liked", likedTVShows)}
        {renderSection("Disliked", dislikedTVShows)}
        {renderSection("Watchlist", watchlistTVShows)}
      </div>
    </section>
  );
}
