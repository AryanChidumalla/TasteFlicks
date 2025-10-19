import { Link } from "react-router-dom";
import { useGenres } from "../movieAPI";

export function MovieCard({ item }) {
  const genres = useGenres();

  const getGenreName = (id) => {
    const genre = genres.find((g) => g.id === id);
    return genre ? genre.name : "Unknown";
  };

  return (
    <Link
      to={`/movie/${item.id}`}
      className="flex flex-col flex-shrink-0 w-[160px] sm:w-[200px] bg-black-200 border border-black-300 text-white-100 rounded cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
    >
      {/* Image Container with fixed aspect ratio */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "2 / 3" }} // fixes height based on width
      >
        <img
          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
          alt="movie poster"
          className="object-cover w-full h-full rounded-t"
          loading="lazy"
        />

        {/* Vote Average Badge */}
        <div className="absolute flex items-center top-2 left-2 bg-black-100 border border-black-300 text-white-100 font-semibold text-sm px-2 py-0.5 rounded">
          <div>{item?.vote_average?.toFixed(1)}</div>
        </div>

        {/* Adult Badge */}
        {item.adult && (
          <div className="absolute flex items-center top-2 right-2 bg-black-100 border border-black-300 text-white-100 font-semibold text-sm px-2 py-0.5 rounded">
            <div>18+</div>
          </div>
        )}
      </div>

      {/* Text Info */}
      <div className="px-3 py-2 flex flex-col gap-1">
        <div className="font-semibold text-sm truncate">{item.title}</div>
      </div>
    </Link>
  );
}
