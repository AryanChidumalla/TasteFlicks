const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const YOUTUBE_EMBED_BASE_URL = "https://www.youtube.com/embed/";

/* -------------------- TRAILERS -------------------- */
function VideoGallery({ videos }) {
  if (!videos?.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-white-100">
        Trailers & Videos
      </h2>

      <div className="overflow-x-auto snap-x snap-mandatory">
        <div className="flex gap-6 pb-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="min-w-[320px] w-[320px] flex-shrink-0 snap-center"
            >
              {/* CARD */}
              <div className="bg-black-200 border border-black-300 rounded-lg overflow-hidden hover:scale-[1.02] transition">
                <iframe
                  width="320"
                  height="180"
                  src={`${YOUTUBE_EMBED_BASE_URL}${video.key}`}
                  title={video.name}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-[180px]"
                />

                <div className="p-3">
                  <p className="text-sm text-white-100 font-medium line-clamp-2">
                    {video.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------- PROVIDERS -------------------- */
function WatchProviders({ providers }) {
  if (!providers?.flatrate?.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-white-100">
        Where to Watch
      </h2>

      <div className="flex gap-5 flex-wrap items-center">
        {providers.flatrate.map((provider) => (
          <div
            key={provider.provider_id}
            className="text-center group cursor-pointer"
          >
            <div className="bg-black-200 border border-black-300 rounded-lg p-2 group-hover:scale-105 transition">
              <img
                src={`${IMAGE_BASE_URL}/w92${provider.logo_path}`}
                alt={provider.provider_name}
                loading="lazy"
                className="w-12 h-12 rounded-md mx-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <p className="text-xs text-white-300 mt-1">
              {provider.provider_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- MAIN -------------------- */
export default function MediaExtras({ videos, providers }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-12">
      {/* TRAILERS */}
      <VideoGallery videos={videos} />

      {/* DIVIDER */}
      <div className="border-t border-black-300" />

      {/* PROVIDERS */}
      <WatchProviders providers={providers} />
    </div>
  );
}
