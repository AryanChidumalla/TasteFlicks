import React from "react";
import { Calendar, Heart, PlayCircle, Star, TrendingUp } from "react-feather";
import { useSearchParams } from "react-router-dom";
import {
  usePopularMoviesInfinite,
  useTopRatedMoviesInfinite,
  useUpcomingMoviesInfinite,
  useTrendingMoviesInfinite,
  useNowPlayingMoviesInfinite,
} from "../hooks/useMediaQueries";
import { Black200Button, PrimaryButton } from "../components/ui/buttons";
import { MediaCard } from "../components/ui/MediaCard";

const MOVIE_CATEGORIES = [
  { name: "Popular", icon: Heart, hook: usePopularMoviesInfinite },
  { name: "Top Rated", icon: Star, hook: useTopRatedMoviesInfinite },
  { name: "Upcoming", icon: Calendar, hook: useUpcomingMoviesInfinite },
  { name: "Trending", icon: TrendingUp, hook: useTrendingMoviesInfinite },
  { name: "Now Playing", icon: PlayCircle, hook: useNowPlayingMoviesInfinite },
];

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "Popular";

  const currentCategory =
    MOVIE_CATEGORIES.find((c) => c.name === category) || MOVIE_CATEGORIES[0];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    currentCategory.hook();

  const movies = data?.pages.flatMap((page) => page.results) || [];

  const handleCategoryChange = (newCategory) => {
    if (newCategory === category) return;
    setSearchParams({ category: newCategory });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white-100">
      <div className="flex flex-col gap-8">
        {/* Header Text Blocks */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white-100 to-white-300 bg-clip-text text-transparent">
            Explore Movies
          </h1>
          <p className="text-xs sm:text-sm text-white-300 max-w-xl">
            Discover the highest-rated titles, community favorites, and trending
            cinema hitting theaters right now.
          </p>
        </div>

        {/* 🎯 Premium Pill Navigation Rails */}
        <nav className="flex flex-wrap gap-2.5 bg-white/[0.01] border border-white/[0.04] p-2 rounded-2xl w-max max-w-full">
          {MOVIE_CATEGORIES.map(({ name, icon }) => {
            const ButtonComponent =
              category === name ? PrimaryButton : Black200Button;
            return (
              <div key={name} className="transition-all duration-200">
                <ButtonComponent
                  name={name}
                  icon={icon}
                  aria-pressed={category === name}
                  onClick={() => handleCategoryChange(name)}
                />
              </div>
            );
          })}
        </nav>

        {/* 🎬 Main Catalog Poster Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-white/[0.03] border border-white/[0.04] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl text-white-300 text-sm">
            No movie items parsed from TMDB endpoints.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="transition-transform duration-300 hover:scale-[1.02]"
                >
                  <MediaCard item={movie} mediaType="movie" />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {hasNextPage && (
              <div className="flex justify-center pt-6 border-t border-white/[0.03]">
                <Black200Button
                  name={
                    isFetchingNextPage
                      ? "Enriching Feed..."
                      : "Load More Titles"
                  }
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
