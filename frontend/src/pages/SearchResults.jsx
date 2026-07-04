import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Star, Film, Tv, Search } from "react-feather";
import { searchMulti, useGenres } from "../services/tmdb/api";
import { Black200Button } from "../components/ui/buttons";
import { MediaCard } from "../components/ui/MediaCard";

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const query = queryParams.get("query") || "";

  const genres = useGenres();

  const getGenreName = (id) => genres.find((g) => g.id === id)?.name || null;

  // Modernized Infinite Query handling for perfect pagination performance
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["multiSearch", query],
      queryFn: ({ pageParam = 1 }) => searchMulti(query, pageParam),
      initialPageParam: 1,
      enabled: !!query,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    });

  const allItems = data?.pages.flatMap((page) => page.results) || [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-8 bg-white/[0.03] w-1/4 rounded-lg" />
        <div className="h-44 bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/[0.03] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!allItems.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-12 h-12 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4 text-white-300">
          <Search size={20} />
        </div>
        <h2 className="text-white-100 font-bold text-lg">
          No Results Discovered
        </h2>
        <p className="text-white-300 text-sm mt-1">
          We couldn't parse matching assets for "{query}".
        </p>
      </div>
    );
  }

  const topResult = allItems[0];
  const restResults = allItems.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white-100 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white-100 to-white-300 bg-clip-text text-transparent">
          Search Results
        </h1>
        <p className="text-xs sm:text-sm text-white-300">
          Showing matching records identified for{" "}
          <span className="text-purple-400 font-semibold">"{query}"</span>
        </p>
      </div>

      {/* 🔥 Top Result Highlight Panel */}
      {topResult && (
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-white-300 pl-1">
            Primary Match
          </h2>
          <div
            onClick={() =>
              navigate(`/media/${topResult.media_type}/${topResult.id}`)
            }
            className="group relative flex flex-col sm:flex-row gap-6 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent border border-white/[0.05] rounded-2xl p-5 items-start cursor-pointer hover:bg-white/[0.02] hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl"
          >
            {/* Poster Framer */}
            <div className="w-[110px] sm:w-[130px] aspect-[2/3] rounded-xl overflow-hidden bg-black-300 flex-shrink-0 shadow-md">
              <img
                src={
                  topResult.poster_path
                    ? `https://image.tmdb.org/t/p/w342${topResult.poster_path}`
                    : "/fallback.jpg"
                }
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Core Context Detail Area */}
            <div className="space-y-3 flex-1">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black group-hover:text-purple-400 transition-colors leading-tight">
                  {topResult.title || topResult.name}
                </h3>

                <div className="flex items-center gap-2 text-xs text-white-300 font-medium flex-wrap">
                  {topResult.vote_average && (
                    <div className="flex items-center gap-0.5 text-yellow-400">
                      <Star size={12} className="fill-current" />
                      <span className="font-bold ml-0.5">
                        {topResult.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <span>•</span>
                  <span>
                    {topResult.release_date?.slice(0, 4) ||
                      topResult.first_air_date?.slice(0, 4) ||
                      "—"}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded-md tracking-wider">
                    {topResult.media_type === "movie" ? (
                      <Film size={10} />
                    ) : (
                      <Tv size={10} />
                    )}
                    <span>
                      {topResult.media_type === "movie" ? "Movie" : "TV Series"}
                    </span>
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white-300 font-normal line-clamp-3 max-w-2xl leading-relaxed">
                {topResult.overview || "No description overview available."}
              </p>

              {topResult.genre_ids && (
                <p className="text-[11px] text-purple-300 font-semibold tracking-wide truncate">
                  {topResult.genre_ids
                    .slice(0, 3)
                    .map(getGenreName)
                    .filter(Boolean)
                    .join("  •  ")}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 🎬 All Results Grid */}
      {restResults.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/[0.03]">
          <h2 className="text-xs font-black uppercase tracking-widest text-white-300 pl-1">
            All Catalog Records
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {restResults.map((item) => (
              <div
                key={item.id}
                className="transition-transform duration-300 hover:scale-[1.02]"
              >
                <MediaCard item={item} mediaType={item.media_type} />
              </div>
            ))}
          </div>

          {/* Load More Button Container */}
          {hasNextPage && (
            <div className="flex justify-center pt-8">
              <Black200Button
                name={
                  isFetchingNextPage
                    ? "Parsing Database..."
                    : "Load More Records"
                }
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
