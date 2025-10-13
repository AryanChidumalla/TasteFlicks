import { Calendar, Heart, PlayCircle, Star, TrendingUp } from "react-feather";
import { useState, useEffect } from "react";
import {
  usePopularMovies,
  useTopRatedMovies,
  useUpcomingMovies,
  useTrendingMovies,
  useNowPlayingMovies,
} from "../hooks/useMoviesApi";
import { Black200Button, PrimaryButton } from "../buttons";
import { MovieCard } from "../components/movieCard";

const MOVIE_CATEGORIES = [
  { name: "Popular", icon: Heart, hook: usePopularMovies },
  { name: "Top Rated", icon: Star, hook: useTopRatedMovies },
  { name: "Upcoming Movies", icon: Calendar, hook: useUpcomingMovies },
  { name: "Trending Movies", icon: TrendingUp, hook: useTrendingMovies },
  { name: "Now Playing", icon: PlayCircle, hook: useNowPlayingMovies },
];

export default function Movies() {
  const [category, setCategory] = useState("Popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [movies, setMovies] = useState([]);

  const currentCategory = MOVIE_CATEGORIES.find((c) => c.name === category);

  // Destructure the hook for data fetching
  const { data, isLoading, isFetching } = currentCategory.hook(currentPage);

  // When category or data changes, update movies list accordingly
  useEffect(() => {
    if (!data || !data.results) return;

    if (currentPage === 1) {
      // On category change or first page, replace list
      setMovies(data.results);
    } else {
      // Append results on next pages
      setMovies((prev) => [...prev, ...data.results]);
    }
  }, [data, currentPage]);

  const handleCategoryChange = (newCategory) => {
    if (newCategory === category) return; // no change
    setCategory(newCategory);
    setCurrentPage(1);
    setMovies([]); // reset movies to avoid showing old data during load
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white-100">
            Movies
          </h1>
          <h2 className="text-base sm:text-lg font-normal text-white-200 mt-2">
            Discover the latest movies across all streaming platforms
          </h2>
        </div>

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

        {isLoading && movies.length === 0 ? (
          <div className="text-center text-white-200 mt-10">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
              {movies.map((movie) => (
                <MovieCard key={movie.id} item={movie} />
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Black200Button
                name={isFetching ? "Loading..." : "Load More"}
                onClick={() => {
                  if (!isFetching) setCurrentPage((prev) => prev + 1);
                }}
                disabled={isFetching}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
