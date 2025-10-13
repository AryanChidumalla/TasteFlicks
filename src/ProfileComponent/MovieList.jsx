import { useNavigate } from "react-router-dom";
import MediaCard from "./MediaCard";

export default function MovieList({ userMovieMedia }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold text-white-100 mb-2">Movies</h2>
      {userMovieMedia.length === 0 ? (
        <div className="text-white-300">No movies in watchlist.</div>
      ) : (
        userMovieMedia.map((movie) => (
          <MediaCard
            key={movie.id}
            media={movie}
            onClick={() => navigate(`/movie/${movie.id}`)}
          />
        ))
      )}
    </div>
  );
}
