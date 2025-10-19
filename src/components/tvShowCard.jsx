import { useNavigate } from "react-router-dom";
import { useGenres } from "../movieAPI";

function TVShowCard({ item }) {
  const navigate = useNavigate();
  const genres = useGenres();

  const getGenreName = (id) => {
    const genre = genres.find((g) => g.id === id);
    return genre ? genre.name : "Unknown";
  };

  return (
    <div
      onClick={() => navigate(`/tvshows/${item.id}`)}
      className="flex flex-col flex-shrink-0 w-[160px] sm:w-[200px] bg-black-200 border border-black-300 text-white-100 rounded cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
    >
      <div className="relative w-full" style={{ aspectRatio: "2 / 3" }}>
        <img
          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
          alt="tv show poster"
          className="object-cover w-full h-full rounded-t"
          loading="lazy"
        />
        <div className="absolute flex gap-2 items-center top-2 left-2 bg-black-100 border border-black-300 text-white-100 font-semibold text-sm px-2 py-0.5 rounded">
          <div>{item.vote_average.toFixed(1)}</div>
        </div>
      </div>

      <div className="px-3 py-2 flex flex-col gap-1">
        <div className="font-semibold text-sm truncate">{item.name}</div>
      </div>
    </div>
  );
}

export default TVShowCard;
