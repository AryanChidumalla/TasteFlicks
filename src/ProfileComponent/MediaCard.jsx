import { useState } from "react";

export default function MediaCard({ media, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="relative flex items-center gap-4 px-4 py-2 bg-black-200 border border-black-300 hover:bg-black-300 cursor-pointer transition-transform rounded hover:scale-105"
      onClick={onClick}
    >
      <div className="w-12 h-18 relative flex-shrink-0">
        {/* Placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-black-300 animate-pulse rounded-sm" />
        )}

        {/* Actual image */}
        <img
          src={
            media.poster_path
              ? `https://image.tmdb.org/t/p/w92${media.poster_path}`
              : "https://via.placeholder.com/92x138?text=No+Image"
          }
          alt={media.title || media.name}
          className={`w-12 h-18 object-cover rounded-sm transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      <div className="text-white-100 flex-1">
        <div className="font-medium">{media.title || media.name}</div>
        <div className="text-sm text-white-300">
          {(media.release_date || media.first_air_date || "Unknown").slice(
            0,
            4
          )}
        </div>
      </div>
    </div>
  );
}
