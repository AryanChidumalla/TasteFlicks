export default function MediaCard({ media, onClick }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-2 bg-black-200 border border-black-300 hover:bg-black-300 cursor-pointer transition-colors rounded"
      onClick={onClick}
    >
      <img
        src={
          media.poster_path
            ? `https://image.tmdb.org/t/p/w92${media.poster_path}`
            : "https://via.placeholder.com/92x138?text=No+Image"
        }
        alt={media.title || media.name}
        className="w-12 h-18 object-cover rounded-sm"
      />

      <div className="text-white-100">
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
