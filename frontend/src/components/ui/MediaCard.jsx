import { Link } from "react-router-dom";
import { Star, Check, Bookmark, X } from "react-feather";
import { useGenres } from "../../services/tmdb/api";
import { useUserMediaPreferences } from "../../hooks/useUserPreferences";

export function MediaCard({ item }) {
  const genres = useGenres();
  const { getMediaPref } = useUserMediaPreferences();
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const media = getMediaPref(mediaType, item.id);

  const watched = media?.watched === true || media?.rating != null;
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
      className="group flex flex-col w-full text-white-100 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-2xl"
    >
      {/* Image Container */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-black-200 border border-white/[0.06] group-hover:border-purple-500/40 transition-all duration-300" style={{ aspectRatio: "2 / 3" }}>
        <img
          src={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/fallback.jpg"
          }
          alt={title || "Media poster"}
          className={`object-cover w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-500 ${borderClass}`}
          loading="lazy"
        />

        {/* State Badges */}
        {watched && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-black p-1 rounded-lg shadow-lg flex items-center justify-center">
            <Check size={13} strokeWidth={3} />
          </div>
        )}

        {!watched && watchlist && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white p-1 rounded-lg shadow-lg flex items-center justify-center">
            <Bookmark size={13} />
          </div>
        )}

        {!watched && !watchlist && notInterested && (
          <div className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-lg shadow-lg flex items-center justify-center">
            <X size={13} />
          </div>
        )}

        {/* User Rating Badge if exists */}
        {media?.rating != null && (
          <div className="absolute bottom-2 right-2 bg-black-200/90 backdrop-blur-md border border-amber-400/30 text-amber-400 text-[11px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
            <Star size={11} fill="currentColor" />
            <span>{media.rating}</span>
          </div>
        )}

        {/* Adult Badge */}
        {item.adult && (
          <div className="absolute top-2 right-2 bg-black-200/90 backdrop-blur-md border border-white/10 text-white-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            18+
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="pt-2.5 pb-1 flex flex-col gap-0.5">
        <div className="font-semibold text-xs sm:text-sm text-white-100 group-hover:text-purple-300 transition-colors truncate">
          {title}
        </div>

        <div className="flex items-center gap-2 text-xs text-white-300/70">
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <Star size={11} fill="currentColor" />
            <span>
              {item?.vote_average ? item.vote_average.toFixed(1) : "NR"}
            </span>
          </div>
          <span>•</span>
          <div>{year}</div>
        </div>

        {item.genre_ids && item.genre_ids.length > 0 && (
          <div className="text-[11px] text-white-300/50 truncate">
            {item.genre_ids
              .slice(0, 2)
              .map(getGenreName)
              .filter(Boolean)
              .join(", ")}
          </div>
        )}
      </div>
    </Link>
  );
}
