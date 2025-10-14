import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Black200Button, PrimaryButton } from "../buttons";
import { MovieCard } from "../components/movieCard"; // Assuming MovieCard is generic enough or a new TVShowCard is used
import {
  Filter,
  Star,
  Calendar,
  TrendingUp,
  PlayCircle,
  Search,
  Heart,
  Tv, // Using a TV icon for TV Shows
} from "react-feather";
// import { useDiscoveredTVShowsInfinite } from "../hooks/useMoviesApi"; // New hook
import debounce from "lodash.debounce";
import { useDiscoveredTVShowsInfinite } from "../hooks/useTVShowsApi";

// Assuming you have a predefined list of genres for TV Shows (often slightly different IDs)
// For simplicity, we'll reuse the movie genres, but in a real app, fetch TV genres.
const GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

const TV_CATEGORIES = [
  { name: "Popular", icon: Heart },
  { name: "Top Rated", icon: Star },
  { name: "Air Date", icon: Calendar }, // Changed from Release Date
];

const currentYear = new Date().getFullYear();

const YEAR = Array.from({ length: 50 }, (_, i) => {
  const year = currentYear - i;
  return { name: year.toString(), value: year.toString() };
});

const SORTBY = [
  { name: "Ascending", value: "asc" },
  { name: "Descending", value: "desc" },
];

const RATING = Array.from({ length: 10 }, (_, i) => {
  const val = (i + 1).toString();
  return { name: val, value: val };
});

export default function ExploreTVShows() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params or fallback to defaults
  const initialCategory = searchParams.get("category") || "Popular";
  const initialGenre =
    searchParams.get("genre") ||
    (GENRES.length > 0 ? GENRES[0].id.toString() : "");
  const initialYear = searchParams.get("year") || YEAR[0].value;
  const initialSortBy = searchParams.get("sortBy") || "popularity.desc";
  const initialRating = searchParams.get("rating") || "7";
  const initialQuery = searchParams.get("query") || "";

  // Parse sortBy into field and order
  const [initialSortField, initialSortOrder] = initialSortBy.split(".");

  // Map of category to sort field (adjusted for TV shows)
  const sortByMap = {
    Popular: "popularity",
    "Top Rated": "vote_average",
    "Air Date": "first_air_date", // Changed for TV
  };

  // Reverse map for category from sortField (for initial load)
  const categoryFromSortField =
    Object.entries(sortByMap).find(
      ([, field]) => field === initialSortField
    )?.[0] || "Popular";

  const [category, setCategory] = useState(
    initialCategory || categoryFromSortField
  );
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState(initialYear);
  const [sortOrder, setSortOrder] = useState(initialSortOrder || "desc");
  const [rating, setRating] = useState(initialRating);
  const [searchText, setSearchText] = useState(initialQuery);

  // Compose sortBy string
  const sortBy = `${sortByMap[category] || "popularity"}.${sortOrder}`;

  // Debounced URL update
  const updateSearchParams = useCallback(
    debounce((newParams) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (value) params.set(key, value);
          else params.delete(key);
        });
        return params;
      });
    }, 400),
    [setSearchParams]
  );

  // Update URL params when filters/search change
  useEffect(() => {
    updateSearchParams({
      category,
      genre,
      year,
      sortBy,
      rating,
    });
  }, [category, genre, year, sortBy, rating, updateSearchParams]);

  // Compose filters for API call
  const filters = useMemo(() => {
    return {
      sortBy,
      genre,
      year,
      minRating: rating,
    };
  }, [sortBy, genre, year, rating]);

  // Use the new TV show hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useDiscoveredTVShowsInfinite(filters);

  const shows = useMemo(
    () => data?.pages.flatMap((page) => page.results) || [],
    [data]
  );

  const handleCategoryChange = useCallback((name) => {
    setCategory(name);
  }, []);

  // 🔍 Handle search
  const handleSearch = () => {
    const trimmed = searchText.trim();
    if (trimmed.length > 0) {
      // Navigate to a TV show search route or adjust the existing one
      navigate(`/search/tv?query=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-semibold text-white-100">
            TV Shows
          </h1>
          <h2 className="text-base sm:text-lg font-normal text-white-200">
            Discover the latest TV shows across all streaming platforms
          </h2>

          {/* Search Bar */}
          <div className="flex bg-black-100 border border-black-300 rounded-md w-full">
            <input
              type="text"
              placeholder="Search for TV shows"
              className="text-white-100 px-5 py-2.5 w-full bg-black-100 focus:outline-none"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
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

        {/* Category Buttons */}
        <div
          role="tablist"
          aria-label="TV show categories"
          className="flex justify-start flex-wrap gap-3 sm:gap-5"
        >
          {TV_CATEGORIES.map(({ name, icon: Icon }) => {
            const ButtonComponent =
              category === name ? PrimaryButton : Black200Button;
            return (
              <ButtonComponent
                key={name}
                name={name}
                icon={Icon}
                role="tab"
                aria-selected={category === name}
                tabIndex={category === name ? 0 : -1}
                onClick={() => handleCategoryChange(name)}
              />
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          {/* Genre Select */}
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-48 px-3 py-2 rounded-md bg-black-100 text-white-100 border border-black-300 focus:outline-none"
            aria-label="Filter by genre"
          >
            {GENRES.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Select - Renamed for clarity */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-48 px-3 py-2 rounded-md bg-black-100 text-white-100 border border-black-300 focus:outline-none"
            aria-label="Filter by first air year"
          >
            {YEAR.map(({ name, value }) => (
              <option key={name} value={value}>
                {name}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-48 px-3 py-2 rounded-md bg-black-100 text-white-100 border border-black-300 focus:outline-none"
            aria-label="Sort order"
          >
            {SORTBY.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>

          {/* Rating Select */}
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-48 px-3 py-2 rounded-md bg-black-100 text-white-100 border border-black-300 focus:outline-none"
            aria-label="Minimum rating"
          >
            {RATING.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* TV Show List */}
        {status === "loading" ? (
          <div className="text-center text-white-200 mt-10">Loading...</div>
        ) : status === "error" ? (
          <div className="text-center text-red-500 mt-10">
            Error: {error.message}
          </div>
        ) : (
          <>
            {shows.length === 0 ? (
              <p className="text-center text-white-200 mt-10">
                No TV shows found.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
                  {/* Reuse MovieCard or create a specific TVShowCard */}
                  {shows.map((show) => (
                    <MovieCard key={show.id} item={show} isTV={true} />
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
          </>
        )}
      </div>
    </div>
  );
}
