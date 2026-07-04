export default function ReviewsList({ reviews }) {
  if (!reviews?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 text-white-300">
        <h2 className="text-lg font-semibold text-white-100 mb-2">Reviews</h2>
        <p className="text-sm">No reviews available yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-6">
      <h2 className="text-lg font-semibold text-white-100">Reviews</h2>

      <div className="space-y-5">
        {reviews.slice(0, 5).map((review) => (
          <div
            key={review.id}
            className="bg-black-200 border border-black-300 rounded-lg p-4"
          >
            {/* Author */}
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-white-100">{review.author}</p>
              <p className="text-xs text-white-300">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Content */}
            <p className="text-sm text-white-300 leading-relaxed line-clamp-5">
              {review.content}
            </p>

            {/* Read full */}
            {review.url && (
              <a
                href={review.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary-400 mt-2 inline-block hover:underline text-white-100"
              >
                Read full review →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
