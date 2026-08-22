import React from "react";
import { Star, Play, Check, X, Bookmark, Film, Tv } from "react-feather";

/* ---------- Helpers ---------- */
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

const formatRuntime = (runtime) =>
  runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : "N/A";

export default function HeroSection({
  mediaDetails,
  isTV,
  setRating,
  setHover,
  displayRating,
  trailerKey,

  /* Supabase state */
  userMedia,

  /* actions */
  onWatched,
  onNotInterested,
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
  const isNotInterested = !!userMedia?.not_interested;
  const isWatchlist = !!userMedia?.watchlist;
  const currentRating = userMedia?.rating || 0;

  return (
    <div className="relative">
      {/* Cinematic Backdrop Banner */}
      <div
        className="w-full h-[65vh] sm:h-[75vh] bg-cover bg-center relative"
        style={{
          backgroundImage: mediaDetails?.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${mediaDetails.backdrop_path})`
            : "",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black-100 via-black-100/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black-100/90 via-black-100/40 to-transparent" />
      </div>

      {/* Main Glassmorphic Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-60 sm:-mt-72 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-black-200/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Poster Column */}
          <div className="md:col-span-4 lg:col-span-3 w-full max-w-[260px] mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-black-300 border border-white/[0.08] shadow-xl">
              <img
                src={
                  mediaDetails?.poster_path
                    ? `https://image.tmdb.org/t/p/w500${mediaDetails.poster_path}`
                    : "/fallback.jpg"
                }
                className="w-full h-full object-cover"
                alt={mediaDetails?.title || mediaDetails?.name || "Media poster"}
              />
            </div>
          </div>

          {/* Details & Actions Column */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Type Badge & Release Year */}
              <div className="flex items-center gap-2.5 text-xs text-white-300 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                  {isTV ? <Tv size={12} /> : <Film size={12} />}
                  <span>{isTV ? "TV Series" : "Movie"}</span>
                </span>
                <span>•</span>
                <span>{formattedDate}</span>
                <span>•</span>
                <span>
                  {isTV
                    ? `${mediaDetails?.number_of_seasons || mediaDetails?.seasons?.length || 1} Seasons`
                    : formatRuntime(mediaDetails?.runtime || 0)}
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white-100 tracking-tight leading-tight">
                  {mediaDetails?.title || mediaDetails?.name}
                </h1>
                {mediaDetails?.tagline && (
                  <p className="text-white-300 italic text-sm mt-1">
                    “{mediaDetails.tagline}”
                  </p>
                )}
              </div>

              {/* Genres Pills */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <span
                      key={g.id}
                      className="bg-white/[0.04] border border-white/[0.06] text-white-200 px-3 py-1 rounded-xl text-xs font-medium"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {mediaDetails?.overview && (
                <p className="text-white-300 text-xs sm:text-sm leading-relaxed max-w-3xl line-clamp-4">
                  {mediaDetails.overview}
                </p>
              )}
            </div>

            {/* Metrics & Action Bar */}
            <div className="pt-4 border-t border-white/[0.06] space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                  <p className="text-[10px] uppercase font-bold text-white-300/70 tracking-wider">
                    TMDB Score
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-base font-bold text-white-100">
                      {voteAvg || "NR"}
                    </span>
                    <span className="text-[10px] text-white-300/60">/ 10</span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                  <p className="text-[10px] uppercase font-bold text-white-300/70 tracking-wider">
                    Community Votes
                  </p>
                  <p className="text-base font-bold text-white-100 mt-0.5">
                    {voteCount ? voteCount.toLocaleString() : "0"}
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                  <p className="text-[10px] uppercase font-bold text-white-300/70 tracking-wider">
                    Your Rating
                  </p>
                  <p className="text-base font-bold text-amber-400 mt-0.5">
                    {currentRating ? `${currentRating} / 10` : "Not Rated"}
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                  <p className="text-[10px] uppercase font-bold text-white-300/70 tracking-wider">
                    Status
                  </p>
                  <p className="text-base font-bold text-white-100 mt-0.5 truncate">
                    {mediaDetails?.status || "Released"}
                  </p>
                </div>
              </div>

              {/* Action Buttons & Rating Pill */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Action Buttons Group */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={onWatched}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                      isWatched
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                        : "bg-white/[0.03] text-white-200 border-white/[0.06] hover:bg-white/[0.07]"
                    }`}
                  >
                    <Check size={14} className={isWatched ? "text-emerald-400" : ""} />
                    <span>{isWatched ? "Watched" : "Mark Watched"}</span>
                  </button>

                  <button
                    onClick={onWatchlist}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                      isWatchlist
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm"
                        : "bg-white/[0.03] text-white-200 border-white/[0.06] hover:bg-white/[0.07]"
                    }`}
                  >
                    <Bookmark size={14} className={isWatchlist ? "text-blue-400 fill-blue-400" : ""} />
                    <span>{isWatchlist ? "In Watchlist" : "Add Watchlist"}</span>
                  </button>

                  <button
                    onClick={onNotInterested}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                      isNotInterested
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-white/[0.03] text-white-200 border-white/[0.06] hover:bg-white/[0.07]"
                    }`}
                  >
                    <X size={14} className={isNotInterested ? "text-rose-400" : ""} />
                    <span>{isNotInterested ? "Hidden" : "Not for Me"}</span>
                  </button>

                  {trailerKey && (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailerKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white-200 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 transition text-purple-300"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Watch Trailer</span>
                    </a>
                  )}
                </div>

                {/* 10-Star Interactive Rating Widget */}
                <div className="flex items-center gap-1.5 bg-black-300/60 border border-white/[0.06] px-3.5 py-1.5 rounded-xl">
                  <span className="text-[11px] text-white-300 mr-1 font-medium hidden sm:inline">
                    Rate:
                  </span>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const fullValue = star * 2;
                    return (
                      <div
                        key={star}
                        className="relative w-6 h-6 cursor-pointer"
                        onMouseLeave={() => setHover(0)}
                      >
                        <Star size={24} className="text-white/[0.1] fill-white/[0.05]" />
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
                            size={24}
                            className="text-amber-400 fill-amber-400"
                          />
                        </div>
                        <div
                          className="absolute left-0 top-0 w-1/2 h-full"
                          onMouseEnter={() => setHover(fullValue - 1)}
                          onClick={() => setRating(fullValue - 1)}
                          title={`Rate ${fullValue - 1} / 10`}
                        />
                        <div
                          className="absolute right-0 top-0 w-1/2 h-full"
                          onMouseEnter={() => setHover(fullValue)}
                          onClick={() => setRating(fullValue)}
                          title={`Rate ${fullValue} / 10`}
                        />
                      </div>
                    );
                  })}
                  {displayRating > 0 && (
                    <span className="text-xs font-bold text-amber-400 ml-1.5 min-w-[32px]">
                      {displayRating}/10
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
