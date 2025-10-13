import { ArrowRight, Play, Search, User } from "react-feather";
import { Black100Button, Black200Button, PrimaryButton } from "../buttons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPopularMovies,
  getPopularTVShows,
  getTrendingMovies,
  getTrendingTVShows,
  searchMulti,
} from "../movieAPI";
import { MovieCard } from "../components/movieCard";
import TVShowCard from "../components/tvShowCard";

export default function Home() {
  const navigate = useNavigate();

  // State variables for all categories
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTVShows, setTrendingTVShows] = useState([]);

  // Fetch data once on mount
  useEffect(() => {
    getPopularMovies().then((data) => setPopularMovies(data.results));
    getPopularTVShows().then((data) => setPopularTVShows(data.results));
    getTrendingMovies().then((data) => setTrendingMovies(data.results));
    getTrendingTVShows().then((data) => setTrendingTVShows(data.results));
  }, []);

  return (
    <>
      <HeroSection navigate={navigate} />

      <PopularMovies movies={popularMovies} navigate={navigate} />

      <PopularTVShows shows={popularTVShows} navigate={navigate} />

      <TrendingMovies movies={trendingMovies} navigate={navigate} />

      <TrendingTVShows shows={trendingTVShows} navigate={navigate} />
    </>
  );
}

function HeroSection({ navigate }) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);

  // Search handler - calls API and sets results
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    const data = await searchMulti(searchText);
    setSearchResults(data.results || []);
    setShowAllResults(false);
  };

  // Limit visible search results unless "Show all" clicked
  const visibleResults = showAllResults
    ? searchResults
    : searchResults.slice(0, 5);

  return (
    <section
      style={{ height: "calc(100vh - 5rem)" }}
      className="bg-gradient-to-r from-black-100 via-[#1F1A4D] to-primary-300 flex items-center justify-center flex-col gap-10 px-4 sm:px-6 md:px-10"
    >
      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-white-100 leading-snug">
        Discover Your Next <br />
        <span className="text-primary-100">Binge-Worthy Adventure</span>
      </h1>

      {/* Subheading */}
      <h2 className="text-lg sm:text-xl md:text-2xl text-center text-white-100 leading-relaxed">
        Find movies and TV shows across all streaming platforms. Track what{" "}
        <br className="hidden sm:inline" />
        you've watched, build your wishlist, and get personalized{" "}
        <br className="hidden sm:inline" />
        recommendations.
      </h2>

      {/* Overlay to close search results dropdown */}
      {searchResults.length > 0 && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setSearchText("");
            setSearchResults([]);
          }}
        />
      )}

      {/* Search input and results dropdown */}
      <div className="relative z-20 w-full max-w-md">
        <div className="flex bg-black-100 border border-black-300 rounded-md w-full">
          <input
            type="text"
            placeholder="Search for movies or TV shows"
            className="text-white-100 px-5 py-2.5 w-full bg-black-100 focus:outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Black200Button name="Search" icon={Search} onClick={handleSearch} />
        </div>

        {/* Dropdown with search results */}
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-black-100 border border-black-300 rounded-md max-h-96 overflow-y-auto shadow-lg">
            {visibleResults.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-4 px-4 py-2 hover:bg-black-300 cursor-pointer transition-colors"
                onClick={() => {
                  if (movie.media_type === "movie") {
                    navigate(`/movie/${movie.id}`);
                  } else {
                    navigate(`/tvshows/${movie.id}`);
                  }
                }}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                      : "https://via.placeholder.com/92x138?text=No+Image"
                  }
                  alt={movie.title || "No Title"}
                  className="w-12 h-18 object-cover rounded-sm"
                />
                <div className="text-white-100 flex-1">
                  <div className="font-medium">
                    {movie.title || movie.name || "Untitled"}
                  </div>
                  <div className="text-sm text-white-300">
                    {movie.release_date
                      ? movie.release_date.slice(0, 4)
                      : "Unknown Year"}
                  </div>
                </div>
                <div className="text-sm px-2 py-0.5 bg-black-200 border border-black-300 text-white-100 rounded">
                  {movie.media_type === "movie" ? "Movie" : "TV Show"}
                </div>
              </div>
            ))}

            {/* Show all results link */}
            {!showAllResults && searchResults.length > 5 && (
              <div
                className="px-4 py-2 text-primary-100 hover:bg-black-300 cursor-pointer border-t border-black-300 transition-colors"
                onClick={() =>
                  navigate(`/search?query=${encodeURIComponent(searchText)}`)
                }
              >
                Show all results...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Call-to-action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <PrimaryButton
          name="Start Exploring"
          icon={Play}
          onClick={() => navigate("/explore")}
        />
        <Black100Button
          name="Sign In"
          icon={User}
          onClick={() => navigate("/signin")}
        />
      </div>
    </section>
  );
}

// Utility hook to handle responsive slice of items based on window width
function useResponsiveSlice(items, mobileLimit = 4, desktopLimit = 6) {
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const updateVisibleItems = () => {
      const isMobile = window.innerWidth < 640; // Tailwind sm breakpoint
      setVisibleItems(items.slice(0, isMobile ? mobileLimit : desktopLimit));
    };

    updateVisibleItems();

    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, [items, mobileLimit, desktopLimit]);

  return visibleItems;
}

function PopularMovies({ movies, navigate }) {
  // Show 4 items on mobile, 6 on desktop
  const visibleMovies = useResponsiveSlice(movies);

  return (
    <section className="flex flex-col px-4 sm:px-6 md:px-10 py-10 gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
            Popular Movies
          </h2>
          <p className="text-white-200 text-sm sm:text-base">
            Most popular movies this week
          </p>
        </div>

        <Black200Button
          name="See All"
          icon={ArrowRight}
          reverse={true}
          onClick={() => navigate("/movies")}
        />
      </div>

      {/* Movies grid */}
      <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleMovies.map((movie) => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    </section>
  );
}

function PopularTVShows({ shows, navigate }) {
  // Show 4 items on mobile, 6 on desktop
  const visibleShows = useResponsiveSlice(shows);

  return (
    <section className="flex flex-col px-4 sm:px-6 md:px-10 py-10 gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
            Popular TV Shows
          </h2>
          <p className="text-white-200 text-sm sm:text-base">
            Most popular shows this week
          </p>
        </div>

        <Black200Button
          name="See All"
          icon={ArrowRight}
          reverse={true}
          onClick={() => navigate("/tvshows")}
        />
      </div>

      {/* Shows grid */}
      <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleShows.map((show) => (
          <TVShowCard key={show.id} item={show} />
        ))}
      </div>
    </section>
  );
}

function TrendingMovies({ movies, navigate }) {
  // Show 4 items on mobile, 6 on desktop
  const visibleMovies = useResponsiveSlice(movies);

  return (
    <section className="flex flex-col px-4 sm:px-6 md:px-10 py-10 gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
            Trending Movies
          </h2>
          <p className="text-white-200 text-sm sm:text-base">
            Most watched movies this week
          </p>
        </div>

        <Black200Button
          name="See All"
          icon={ArrowRight}
          reverse={true}
          onClick={() => navigate("/movies")}
        />
      </div>

      {/* Movies grid */}
      <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleMovies.map((movie) => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    </section>
  );
}

function TrendingTVShows({ shows, navigate }) {
  // Show 4 items on mobile, 6 on desktop
  const visibleShows = useResponsiveSlice(shows);

  return (
    <section className="flex flex-col px-4 sm:px-6 md:px-10 py-10 gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
            Trending TV Shows
          </h2>
          <p className="text-white-200 text-sm sm:text-base">
            Most watched shows this week
          </p>
        </div>

        <Black200Button
          name="See All"
          icon={ArrowRight}
          reverse={true}
          onClick={() => navigate("/tvshows")}
        />
      </div>

      {/* Shows grid */}
      <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleShows.map((show) => (
          <TVShowCard key={show.id} item={show} />
        ))}
      </div>
    </section>
  );
}
