import { Link } from "react-router-dom";
import { Star } from "react-feather";
import { useGenres } from "../../services/tmdb/api";

export function MediaCard({ item }) {
  const genres = useGenres();

  const getGenreName = (id) => {
    const genre = genres.find((g) => g.id === id);
    return genre ? genre.name : null;
  };

  // Helper to get the correct title and year
  const title = item.title || item.name;
  const year = item.release_date
    ? item.release_date.slice(0, 4)
    : item.first_air_date
      ? item.first_air_date.slice(0, 4)
      : "—";

  // Determine if it's a movie or TV show based on media_type
  const mediaType = item.media_type || (item.title ? "movie" : "tv");

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
          className="object-cover w-full h-full rounded-lg border border-black-300"
          loading="lazy"
        />

        {/* Adult Badge */}
        {item.adult && (
          <div className="absolute top-2 right-2 bg-black-100 border border-black-300 text-white-100 text-sm px-2 py-0.5 rounded">
            18+
          </div>
        )}
      </div>

      {/* Info */}
      <div className="py-3 flex flex-col gap-1">
        {/* Title */}
        <div className="font-semibold text-sm truncate">{title}</div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-tiny text-gray-300">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-[12px] h-[12px] text-primary-100" />
            <span>
              {item?.vote_average ? item.vote_average.toFixed(1) : "NR"}
            </span>
          </div>

          <span>•</span>

          {/* Year */}
          <div>{year}</div>

          {/* <span>•</span>

          <div>{item.media_type === "movie" ? "Movie" : "TV Show"}</div> */}
        </div>

        {/* Optional Genres */}
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
