import { Star, Play, Eye, XSquare, Bookmark } from "react-feather";

/* ---------- Helpers ---------- */
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

const formatRuntime = (runtime) =>
  runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : "N/A";

export default function HeroSection({
  mediaDetails,
  isTV,
  rating,
  setRating,
  hover,
  setHover,
  displayRating,
  trailerKey,

  /* Supabase state */
  userMedia,

  /* actions */
  onWatched,
  onNotInterested, // ⚡ Renamed action
  onWatchlist,
}) {
  const genres = mediaDetails?.genres || [];
  const voteAvg = mediaDetails?.vote_average?.toFixed(1);
  const voteCount = mediaDetails?.vote_count;
  const releaseDate =
    mediaDetails?.release_date || mediaDetails?.first_air_date;
  const formattedDate = formatDate(releaseDate);

  /* ---------- SAFE USER STATE ---------- */
  const isWatched = !!userMedia?.watched;
  const isNotInterested = !!userMedia?.not_interested; // ⚡ Adapted to track the hidden state flag
  const isWatchlist = !!userMedia?.watchlist;

  const savedRating = userMedia?.rating || 0;
  const activeRating = hover || savedRating;

  return (
    <div className="relative">
      {/* BACKDROP */}
      <div
        className="w-full h-[80vh] bg-cover bg-center relative"
        style={{
          backgroundImage: mediaDetails?.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${mediaDetails.backdrop_path})`
            : "",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 -mt-72 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 bg-black/40 backdrop-blur-md rounded-xl p-6">
          {/* POSTER */}
          <div className="w-full max-w-sm mx-auto md:mx-0">
            {mediaDetails?.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${mediaDetails.poster_path}`}
                className="rounded-lg shadow-lg w-full"
                alt="poster"
              />
            ) : (
              <div className="bg-black-300 rounded-lg h-[450px] flex items-center justify-center">
                <span className="text-white-300">No Poster</span>
              </div>
            )}
          </div>

          {/* MAIN INFO */}
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white-100">
              {mediaDetails?.title || mediaDetails?.name}
            </h1>

            {mediaDetails?.tagline && (
              <p className="text-white-300 italic">“{mediaDetails.tagline}”</p>
            )}

            <p className="text-white-300 text-sm md:text-base leading-relaxed">
              {mediaDetails?.overview}
            </p>

            {/* GENRES */}
            <div>
              <p className="text-xs uppercase text-white-300 mb-2 tracking-wider">
                Genres
              </p>
              <div className="flex flex-wrap gap-2 text-white-100">
                {genres.map((g) => (
                  <span
                    key={g.id}
                    className="bg-black-200 border border-black-300 px-3 py-1 rounded-full text-xs"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-white-100">
              <div className="bg-black-200 border border-black-300 rounded-lg p-3">
                <p className="text-xs text-white-300 uppercase">Rating</p>
                <p className="text-lg font-semibold">{voteAvg} / 10</p>
                <p className="text-xs text-white-300">
                  {voteCount?.toLocaleString()} votes
                </p>
              </div>

              <div className="bg-black-200 border border-black-300 rounded-lg p-3">
                <p className="text-xs text-white-300 uppercase">Release Date</p>
                <p className="text-sm font-semibold">{formattedDate}</p>
              </div>

              <div className="bg-black-200 border border-black-300 rounded-lg p-3">
                <p className="text-xs text-white-300 uppercase">
                  {isTV ? "Seasons" : "Runtime"}
                </p>
                <p className="text-sm font-semibold">
                  {isTV
                    ? mediaDetails?.seasons?.length || "N/A"
                    : formatRuntime(mediaDetails?.runtime || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-2">
              {/* Watched */}
              <button
                onClick={onWatched}
                className={`flex flex-col items-center cursor-pointer transition hover:scale-105 ${
                  isWatched ? "text-primary-100" : "text-white-300"
                }`}
              >
                <Eye size={30} />
                <span className="text-xs mt-1">Watched</span>
              </button>

              {/* Not Interested ⚡ */}
              <button
                onClick={onNotInterested}
                className={`flex flex-col items-center cursor-pointer transition hover:scale-105 ${
                  isNotInterested
                    ? "text-red-500"
                    : "text-white-300 hover:text-red-400"
                }`}
              >
                <XSquare size={30} />
                <span className="text-xs mt-1 whitespace-nowrap">
                  Not for Me
                </span>
              </button>

              {/* Watchlist */}
              <button
                onClick={onWatchlist}
                className={`flex flex-col items-center cursor-pointer transition hover:scale-105 ${
                  isWatchlist ? "text-primary-100" : "text-white-300"
                }`}
              >
                <Bookmark size={30} />
                <span className="text-xs mt-1">Watchlist</span>
              </button>

              {/* Trailer */}
              {trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailerKey}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white-300 hover:text-blue-400 flex items-center gap-1 text-xs"
                >
                  <Play size={14} /> Trailer
                </a>
              )}
            </div>

            {/* RATING */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const fullValue = star * 2;
                return (
                  <div
                    key={star}
                    className="relative w-9 h-9 cursor-pointer"
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star size={36} className="text-gray-500 fill-gray-500" />
                    <div
                      className="absolute top-0 left-0 overflow-hidden h-full"
                      style={{
                        width:
                          displayRating >= fullValue
                            ? "100%"
                            : displayRating >= fullValue - 1
                              ? "50%"
                              : "0%",
                      }}
                    >
                      <Star
                        size={36}
                        className="text-primary-100 fill-primary-100"
                      />
                    </div>
                    <div
                      className="absolute left-0 top-0 w-1/2 h-full"
                      onMouseEnter={() => setHover(fullValue - 1)}
                      onClick={() => setRating(fullValue - 1)}
                    />
                    <div
                      className="absolute right-0 top-0 w-1/2 h-full"
                      onMouseEnter={() => setHover(fullValue)}
                      onClick={() => setRating(fullValue)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
