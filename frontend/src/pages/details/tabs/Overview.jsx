const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function Overview({ mediaDetails, isTV, providers }) {
  const formatRuntime = (runtime) => {
    if (!runtime || runtime <= 0) return "N/A";

    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;

    return `${hours} hr ${minutes} min`;
  };

  const rating = mediaDetails?.vote_average?.toFixed(1);
  const votes = mediaDetails?.vote_count;

  const languages = mediaDetails?.spoken_languages
    ?.map((l) => l.english_name)
    .join(", ");
  const countries = mediaDetails?.production_countries
    ?.map((c) => c.name)
    .join(", ");
  const companies = mediaDetails?.production_companies
    ?.slice(0, 3)
    .map((c) => c.name)
    .join(", ");

  return (
    <div className="space-y-6 text-sm text-white-100">
      {/* 🔥 HERO STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-black-200 border border-black-300 rounded-lg p-3">
          <p className="text-white-300 text-xs">Rating</p>
          <p className="text-lg font-semibold">
            {rating ? `${rating} / 10` : "N/A"}
          </p>
          <p className="text-xs text-white-300">
            {votes ? `${votes.toLocaleString()} votes` : ""}
          </p>
        </div>

        <div className="bg-black-200 border border-black-300 rounded-lg p-3">
          <p className="text-white-300 text-xs">
            {isTV ? "Seasons" : "Runtime"}
          </p>
          <p className="text-lg font-semibold">
            {isTV
              ? mediaDetails?.seasons?.length || "N/A"
              : formatRuntime(mediaDetails?.runtime)}
          </p>
        </div>

        <div className="bg-black-200 border border-black-300 rounded-lg p-3">
          <p className="text-white-300 text-xs">Release</p>
          <p className="text-sm font-semibold">
            {mediaDetails?.release_date || mediaDetails?.first_air_date
              ? new Date(
                  mediaDetails.release_date || mediaDetails.first_air_date,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>
      </div>

      {/* 🎬 TAGLINE */}
      {mediaDetails?.tagline && (
        <p className="italic text-white-300 text-center">
          “{mediaDetails.tagline}”
        </p>
      )}

      {/* 📊 INFO GRID */}
      <div className="space-y-3">
        {/* Status */}
        {isTV && (
          <div>
            <span className="font-semibold">Status:</span>{" "}
            {mediaDetails?.status || "N/A"}
          </div>
        )}

        {/* Language */}
        {languages && (
          <div>
            <span className="font-semibold">Language:</span> {languages}
          </div>
        )}

        {/* Countries */}
        {countries && (
          <div>
            <span className="font-semibold">Country:</span> {countries}
          </div>
        )}

        {/* Companies */}
        {companies && (
          <div>
            <span className="font-semibold">Production:</span> {companies}
          </div>
        )}
      </div>

      {/* 🎭 GENRES */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-semibold mr-2">Genres:</span>

        {mediaDetails?.genres?.length ? (
          mediaDetails.genres.map((genre) => (
            <span
              key={genre.id}
              className="bg-black-200 border border-black-300 rounded-full px-3 py-1 text-xs"
            >
              {genre.name}
            </span>
          ))
        ) : (
          <span className="text-white-300">N/A</span>
        )}
      </div>

      <hr className="max-w-7xl mx-auto border-black-300" />
      <WatchProviders providers={providers} />
    </div>
  );
}

function WatchProviders({ providers }) {
  if (!providers?.flatrate) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Available to Stream</h2>
      <div className="flex gap-4 items-center flex-wrap">
        {providers.flatrate.map((provider) => (
          <div key={provider.provider_id} className="text-center">
            <img
              src={`${IMAGE_BASE_URL}/w45${provider.logo_path}`}
              alt={`${provider.provider_name} logo`}
              className="rounded-md w-12 h-12 mx-auto"
              loading="lazy"
            />
            <p className="text-sm text-white-300 mt-1">
              {provider.provider_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
