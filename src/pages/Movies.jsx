import {
  Calendar,
  Heart,
  PlayCircle,
  Star,
  TrendingUp,
  Search,
} from "react-feather";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  usePopularMoviesInfinite,
  useTopRatedMoviesInfinite,
  useUpcomingMoviesInfinite,
  useTrendingMoviesInfinite,
  useNowPlayingMoviesInfinite,
} from "../hooks/useMoviesApi";
import { Black200Button, PrimaryButton } from "../buttons";
import { MovieCard } from "../components/movieCard";

const MOVIE_CATEGORIES = [
  { name: "Popular", icon: Heart, hook: usePopularMoviesInfinite },
  { name: "Top Rated", icon: Star, hook: useTopRatedMoviesInfinite },
  { name: "Upcoming Movies", icon: Calendar, hook: useUpcomingMoviesInfinite },
  {
    name: "Trending Movies",
    icon: TrendingUp,
    hook: useTrendingMoviesInfinite,
  },
  { name: "Now Playing", icon: PlayCircle, hook: useNowPlayingMoviesInfinite },
];

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🧭 Extract from URL
  const category = searchParams.get("category") || "Popular";
  const searchText = searchParams.get("query") || "";

  const currentCategory = MOVIE_CATEGORIES.find((c) => c.name === category);

  // 🎬 Fetch movies using Infinite Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = currentCategory.hook();

  // Flatten all pages into a single movie list
  const movies = data?.pages.flatMap((page) => page.results) || [];

  // 🧭 Handle category change
  const handleCategoryChange = (newCategory) => {
    if (newCategory === category) return;
    setSearchParams({ category: newCategory });
    refetch();
  };

  // 🔍 Handle search
  const handleSearch = () => {
    const trimmed = searchText.trim();
    if (trimmed.length > 0) {
      setSearchParams({
        category,
        query: trimmed,
      });
      navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col gap-6">
        {/* 🧠 SEARCH BAR */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-semibold text-white-100">
            Movies
          </h1>
          <h2 className="text-base sm:text-lg font-normal text-white-200">
            Discover the latest movies across all streaming platforms
          </h2>

          <div className="flex bg-black-100 border border-black-300 rounded-md w-full">
            <input
              type="text"
              placeholder="Search for movies"
              className="text-white-100 px-5 py-2.5 w-full bg-black-100 focus:outline-none"
              value={searchText}
              onChange={(e) => {
                const newQuery = e.target.value;
                setSearchParams({
                  category,
                  query: newQuery,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Black200Button
              name="Search"
              icon={Search}
              onClick={handleSearch}
            />
          </div>
        </div>

        {/* 🎯 CATEGORY BUTTONS */}
        <div className="flex justify-between">
          <div className="flex flex-wrap gap-3 sm:gap-5">
            {MOVIE_CATEGORIES.map(({ name, icon }) => {
              const ButtonComponent =
                category === name ? PrimaryButton : Black200Button;
              return (
                <ButtonComponent
                  key={name}
                  name={name}
                  icon={icon}
                  aria-pressed={category === name}
                  onClick={() => handleCategoryChange(name)}
                />
              );
            })}
          </div>
        </div>

        {/* 🎬 MOVIE LIST */}
        {isLoading ? (
          <div className="text-center text-white-200 mt-10">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
              {movies.map((movie) => (
                <MovieCard key={movie.id} item={movie} />
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Black200Button
                  name={isFetchingNextPage ? "Loading..." : "Load More"}
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
