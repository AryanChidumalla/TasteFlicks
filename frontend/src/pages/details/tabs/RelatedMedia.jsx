import { MediaCard } from "../../../components/ui/MediaCard";

function RelatedMedia({ relatedMedia }) {
  if (!relatedMedia) return null;

  if (relatedMedia.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 text-white-300">
        <h2 className="text-lg font-semibold text-white-100 mb-2">
          More Like This
        </h2>
        <p className="text-sm">No similar titles found.</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white-100">More Like This</h2>
        <p className="text-xs text-white-300 mt-1">
          You might also enjoy these recommendations
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {relatedMedia.slice(0, 20).map((media) => (
          <MediaCard key={media.id} item={media} />
        ))}
      </div>
    </section>
  );
}

export default RelatedMedia;
