import { useNavigate } from "react-router-dom";
import MediaCard from "./MediaCard";

export default function TVShowList({ userTVMedia }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold text-white-100 mb-2">TV Shows</h2>
      {userTVMedia.length === 0 ? (
        <div className="text-white-300">No TV shows in watchlist.</div>
      ) : (
        userTVMedia.map((show) => (
          <MediaCard
            key={show.id}
            media={show}
            onClick={() => navigate(`/tvshows/${show.id}`)}
          />
        ))
      )}
    </div>
  );
}
