import { Link } from "react-router-dom";
import { Star, Check, Bookmark, X } from "react-feather"; // ⚡ Added Check icon
import { useGenres } from "../../services/tmdb/api";
import { useSelector } from "react-redux";

export function MediaCard({ item }) {
  const genres = useGenres();
  const watchedMovies = useSelector((state) => state.mediaPreference.movies);
  const watchedTv = useSelector((state) => state.mediaPreference.tv);
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const media =
    mediaType === "movie"
      ? watchedMovies.find((movie) => movie.media_id === item.id)
      : watchedTv.find((show) => show.media_id === item.id);

  const watched = media?.rating != null;
  const watchlist = media?.watchlist === true;
  const notInterested = media?.not_interested === true;

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

  const borderClass = watched
    ? "border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
    : watchlist
      ? "border-2 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
      : notInterested
        ? "border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
        : "border border-black-300";

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
          className={`object-cover w-full h-full rounded-lg transition duration-300 ${borderClass}`}
          loading="lazy"
        />

        {watched && (
          <div className="absolute top-2 left-2 bg-emerald-500 p-1 rounded-md">
            <Check size={14} className="text-black" />
          </div>
        )}

        {!watched && watchlist && (
          <div className="absolute top-2 left-2 bg-blue-500 p-1 rounded-md">
            <Bookmark size={14} className="text-white" />
          </div>
        )}

        {!watched && !watchlist && notInterested && (
          <div className="absolute top-2 left-2 bg-red-500 p-1 rounded-md">
            <X size={14} className="text-white" />
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
