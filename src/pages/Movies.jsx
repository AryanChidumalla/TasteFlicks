import { Calendar, Heart, PlayCircle, Star, TrendingUp } from "react-feather";
import { Black200Button, PrimaryButton } from "../buttons";
import { useEffect, useState } from "react";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from "../movieAPI";
import { MovieCard } from "../components/movieCard";

const MOVIE_CATEGORIES = [
  { name: "Popular", icon: Heart },
  { name: "Top Rated", icon: Star },
  { name: "Upcoming Movies", icon: Calendar },
  { name: "Trending Movies", icon: TrendingUp },
  { name: "Now Playing", icon: PlayCircle },
];

export default function Movies() {
  const [category, setCategory] = useState("Popular");

  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMoviesByCategory = (category, page) => {
    switch (category) {
      case "Popular":
        return getPopularMovies(page);
      case "Top Rated":
        return getTopRatedMovies(page);
      case "Upcoming Movies":
        return getUpcomingMovies(page);
      case "Trending Movies":
        return getTrendingMovies(page);
      case "Now Playing":
        return getNowPlayingMovies(page);
      default:
        return Promise.resolve({ results: [] });
    }
  };

  // Load movies on category change (reset page)
  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    fetchMoviesByCategory(category, 1).then((data) => {
      const results = Array.isArray(data?.results) ? data.results : [];

      switch (category) {
        case "Popular":
          setPopularMovies(results);
          break;
        case "Top Rated":
          setTopRatedMovies(results);
          break;
        case "Upcoming Movies":
          setUpcomingMovies(results);
          break;
        case "Trending Movies":
          setTrendingMovies(results);
          break;
        case "Now Playing":
          setNowPlayingMovies(results);
          break;
      }
      setLoading(false);
    });
  }, [category]);

  // Load more movies when page increments (except page 1)
  useEffect(() => {
    if (currentPage === 1) return;

    setLoading(true);

    fetchMoviesByCategory(category, currentPage).then((data) => {
      const results = Array.isArray(data?.results) ? data.results : [];

      switch (category) {
        case "Popular":
          setPopularMovies((prev) => [...prev, ...results]);
          break;
        case "Top Rated":
          setTopRatedMovies((prev) => [...prev, ...results]);
          break;
        case "Upcoming Movies":
          setUpcomingMovies((prev) => [...prev, ...results]);
          break;
        case "Trending Movies":
          setTrendingMovies((prev) => [...prev, ...results]);
          break;
        case "Now Playing":
          setNowPlayingMovies((prev) => [...prev, ...results]);
          break;
      }
      setLoading(false);
    });
  }, [currentPage, category]);

  const getCurrentMoviesList = () => {
    switch (category) {
      case "Popular":
        return popularMovies;
      case "Top Rated":
        return topRatedMovies;
      case "Upcoming Movies":
        return upcomingMovies;
      case "Trending Movies":
        return trendingMovies;
      case "Now Playing":
        return nowPlayingMovies;
      default:
        return [];
    }
  };

  const currentMovies = getCurrentMoviesList();

  const renderButton = ({ name, icon: Icon }) => {
    const ButtonComponent = category === name ? PrimaryButton : Black200Button;
    return (
      <ButtonComponent
        key={name}
        name={name}
        icon={Icon}
        aria-pressed={category === name}
        onClick={() => setCategory(name)}
      />
    );
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
          {MOVIE_CATEGORIES.map(renderButton)}
        </div>

        {loading && currentMovies.length === 0 ? (
          <div className="text-center text-white-200 mt-10">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
              {currentMovies.map((movie) => (
                <MovieCard key={movie.id} item={movie} />
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Black200Button
                name={loading ? "Loading..." : "Load More"}
                onClick={() => !loading && setCurrentPage((prev) => prev + 1)}
                disabled={loading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
