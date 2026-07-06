import { Link } from "react-router-dom";
import { Star, Check } from "react-feather"; // ⚡ Added Check icon
import { useGenres } from "../../services/tmdb/api";
import { useSelector } from "react-redux";

export function MediaCard({ item }) {
  const genres = useGenres();
  const watchedMovies = useSelector((state) => state.mediaPreference.movies);
  const watchedTv = useSelector((state) => state.mediaPreference.tv);

  // ⚡ 1. Determine mediaType FIRST to prevent "Cannot access 'mediaType' before initialization" crash
  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  // ⚡ 2. Safely look up the watch status
  const mediaWatched =
    mediaType === "movie"
      ? watchedMovies.some(
          (movie) => movie.media_id === item.id && movie.rating != null,
        )
      : watchedTv.some(
          (show) => show.media_id === item.id && show.rating != null,
        );

  const getGenreName = (id) => {
    const genre = genres.find((g) => g.id === id);
    return genre ? genre.name : null;
  };

  const title = item.title || item.name;
  const year = item.release_date
    ? item.release_date.slice(0, 4)
    : item.first_air_date
      ? item.first_air_date.slice(0, 4)
      : "—";

  return (
    <Link
      to={`/media/${mediaType}/${item.id}`}
      className="flex flex-col flex-shrink-0 w-[160px] sm:w-[200px] text-white-100 rounded cursor-pointer transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image Container */}
      <div className="relative w-full" style={{ aspectRatio: "2 / 3" }}>
        <img
          src={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/fallback.jpg"
          }
          alt={title || "media poster"}
          // ⚡ Dynamic border color conditional check (turns green and glows if watched)
          className={`object-cover w-full h-full rounded-lg transition duration-300 ${
            mediaWatched
              ? "border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              : "border border-black-300"
          }`}
          loading="lazy"
        />

        {/* ⚡ Watched Indicator Overlay (Top Left) */}
        {mediaWatched && (
          <div
            className="absolute top-2 left-2 bg-emerald-500 text-black border border-emerald-400 p-1 rounded-md shadow-lg flex items-center justify-center"
            title="Watched"
          >
            <Check size={14} strokeWidth={3} className="text-black" />
          </div>
        )}

        {/* Adult Badge */}
        {item.adult && (
          <div className="absolute top-2 right-2 bg-black-100 border border-black-300 text-white-100 text-sm px-2 py-0.5 rounded">
            18+
          </div>
        )}
      </div>

      {/* Info */}
      <div className="py-3 flex flex-col gap-1">
        <div className="font-semibold text-sm truncate">{title}</div>

        <div className="flex items-center gap-2 text-tiny text-gray-300">
          <div className="flex items-center gap-1">
            <Star className="w-[12px] h-[12px] text-primary-100" />
            <span>
              {item?.vote_average ? item.vote_average.toFixed(1) : "NR"}
            </span>
          </div>
          <span>•</span>
          <div>{year}</div>
        </div>

        <div className="text-[0.75rem] text-gray-500 truncate">
          {item.genre_ids
            ?.slice(0, 2)
            .map(getGenreName)
            .filter(Boolean)
            .join(", ")}
        </div>
      </div>
    </Link>
  );
}
