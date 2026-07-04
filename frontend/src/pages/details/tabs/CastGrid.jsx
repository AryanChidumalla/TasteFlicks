import { useNavigate } from "react-router-dom";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function CastGrid({ cast }) {
  const navigate = useNavigate();

  if (!cast || cast.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        <h2 className="text-lg font-semibold mb-4">Cast</h2>
        <p className="text-white-300 text-sm">No cast information available.</p>
      </div>
    );
  }

  const visibleCast = cast.slice(0, 20);

  const getCharacterName = (actor) =>
    actor.character || actor.roles?.[0]?.character || "Unknown Role";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Cast</h2>

        {cast.length > 20 && (
          <button className="text-sm text-white-300 hover:text-white transition">
            View all
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {visibleCast.map((actor) => (
          <button
            key={actor.id}
            onClick={() => navigate(`/person/${actor.id}`)}
            className="text-center group focus:outline-none"
          >
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg bg-black-300 aspect-[2/3]">
              {actor.profile_path ? (
                <img
                  src={`${IMAGE_BASE_URL}/w185${actor.profile_path}`}
                  alt={`${actor.name} profile`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white-300 text-xs">No Image</span>
                </div>
              )}
            </div>

            {/* Name */}
            <p className="mt-2 font-medium text-sm text-white-100 line-clamp-1">
              {actor.name}
            </p>

            {/* Character */}
            <p className="text-xs text-white-300 line-clamp-1">
              {getCharacterName(actor)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
