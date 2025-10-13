import { useNavigate } from "react-router-dom";
import { useGenres } from "../movieAPI";

export function MovieCard({ item }) {
  const navigate = useNavigate();
  const genres = useGenres();

  const getGenreName = (id) => {
    const genre = genres.find((g) => g.id === id);
    return genre ? genre.name : "Unknown";
  };

  const maxVisibleGenres = 2;
  const totalGenres = item.genre_ids.length;
  const visibleGenres = item.genre_ids.slice(0, maxVisibleGenres);
  const hiddenCount = totalGenres - maxVisibleGenres;

  return (
    <div
      onClick={() => navigate(`/movie/${item.id}`)}
      className="flex flex-col bg-black-200 border border-black-300 text-white-100 rounded w-[200px] hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative">
        <img
          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
          alt="movie poster"
          width={200}
          height={300}
          className="block"
        />
        <div className="absolute flex gap-2 items-center top-2 left-2 bg-black-100 border border-black-300 text-white-100 font-semibold text-sm px-2 py-0.5 rounded">
          <div>{item.vote_average.toFixed(1)}</div>
        </div>
      </div>

      <div className="px-5 py-2.5 flex flex-col gap-2.5">
        <div className="font-xl font-semibold truncate">{item.title}</div>

        {/* <div className="text-sm">{item.release_date.slice(0, 4)}</div> */}

        {/* <div className="flex flex-wrap gap-2">
          {visibleGenres.map((id) => (
            <div
              className="bg-black-100 border border-black-300 rounded-full px-4 py-1 text-sm"
              key={id}
            >
              {getGenreName(id)}
            </div>
          ))}

          {hiddenCount > 0 && (
            <div className="bg-black-100 border border-black-300 rounded-full px-4 py-1 text-sm">
              +{hiddenCount}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}
