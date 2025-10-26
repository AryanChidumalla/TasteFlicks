import { useEffect, useState } from "react";
import axios from "axios";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails } from "../movieAPI";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export function RecommendedToUser({ recommendations, error, isLoading }) {
  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {isLoading || !recommendations ? (
        // 🦴 Skeleton Loader
        <div className="p-6 sm:p-10 flex flex-col gap-6">
          <div>
            <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
              Recommended for You
            </h2>
            <p className="text-white-200 text-sm sm:text-base">
              Curated films we think are worth your time.
            </p>
          </div>

          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar pb-2 sm:pb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRecommendationCard key={i} />
            ))}
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        // 🎬 Actual Movie Cards
        <div className="p-6 sm:p-10 flex flex-col gap-6">
          <div>
            <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
              Recommended for You
            </h2>
            <p className="text-white-200 text-sm sm:text-base">
              Curated films we think are worth your time.
            </p>
          </div>

          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar pb-2 sm:pb-4">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
                className="flex flex-shrink-0 w-[280px] sm:w-[340px] md:w-[400px] bg-black-200 border border-black-300 text-white-100 rounded-lg overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all"
              >
                {/* Poster */}
                <div className="w-[100px] sm:w-[120px] md:w-[150px] flex-shrink-0 relative">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt="movie poster"
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                    {item.vote_average.toFixed(1)}
                  </div>
                  {item.adult && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                      18+
                    </div>
                  )}
                </div>

                {/* Text Info */}
                <div className="p-3 flex flex-col gap-2 justify-start flex-grow">
                  <div className="font-semibold text-base sm:text-lg md:text-xl leading-snug line-clamp-2">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white-200">
                    <div>{item.release_date?.slice(0, 4)}</div>
                    <div className="text-white-300">·</div>
                    <div>{`${Math.floor(item.runtime / 60)}h ${
                      item.runtime % 60
                    }m`}</div>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 items-center text-xs sm:text-sm text-white-200">
                    {item.genres && item.genres.length > 0 ? (
                      item.genres.map((genre, index) => (
                        <span key={genre.id} className="flex items-center">
                          {genre.name}
                          {index < item.genres.length - 1 && (
                            <span className="text-white-300">·</span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-white-300">N/A</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="text-white-300 p-6 sm:p-10">
            No recommendations yet. Like some movies to get personalized picks!
          </p>
        )
      )}
    </div>
  );
}

export function SkeletonRecommendationCard() {
  return (
    <div className="animate-pulse flex flex-shrink-0 w-[280px] sm:w-[340px] md:w-[400px] bg-black-200 border border-black-300 text-white-100 rounded-lg overflow-hidden">
      {/* Poster Placeholder */}
      <div className="w-[100px] sm:w-[120px] md:w-[150px] bg-white-300/20 h-[150px] sm:h-[180px] md:h-[200px]" />

      {/* Text Info Placeholder */}
      <div className="p-3 flex flex-col gap-2 justify-start flex-grow">
        <div className="h-5 bg-white-300/30 rounded w-3/4" />
        <div className="h-4 bg-white-300/20 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-3 bg-white-300/20 rounded w-10" />
          <div className="h-3 bg-white-300/20 rounded w-10" />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="h-3 bg-white-300/20 rounded w-12" />
          <div className="h-3 bg-white-300/20 rounded w-10" />
          <div className="h-3 bg-white-300/20 rounded w-8" />
        </div>
      </div>
    </div>
  );
}
