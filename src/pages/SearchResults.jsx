import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchMovies, searchTVShows } from "../movieAPI";
import { MovieCard } from "../components/movieCard";
import { Black200Button, PrimaryButton } from "../buttons";
import TVShowCard from "../components/tvShowCard";
import { Search } from "react-feather";

function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const [mediaType, setMediaType] = useState("movie"); // 'movie' or 'tv'

  // Search results
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTVResults] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  //   Unified fetch function based on media type
  const fetchResults = (type, page) => {
    setSearchText(query);
    switch (type) {
      case "movie":
        return searchMovies(query, page);
      case "tv":
        return searchTVShows(query, page);
      default:
        return Promise.resolve({ results: [] });
    }
  };

  useEffect(() => {
    if (!query) return;

    setCurrentPage(1);

    fetchResults(mediaType, 1).then((data) => {
      const results = Array.isArray(data?.results) ? data.results : [];

      switch (mediaType) {
        case "movie":
          setMovieResults(results);
          break;
        case "tv":
          setTVResults(results);
          break;
        default:
          break;
      }
    });
  }, [mediaType, query]); // ✅ Now listens to query change too

  // Effect for loading more pages (page > 1)
  useEffect(() => {
    if (currentPage === 1) return;

    fetchResults(mediaType, currentPage).then((data) => {
      const results = Array.isArray(data?.results) ? data.results : [];

      switch (mediaType) {
        case "movie":
          setMovieResults((prev) => [...prev, ...results]);
          break;
        case "tv":
          setTVResults((prev) => [...prev, ...results]);
          break;
        default:
          break;
      }
    });
  }, [currentPage, mediaType]);

  const getCurrentResults = () => {
    switch (mediaType) {
      case "movie":
        return movieResults;
      case "tv":
        return tvResults;
      default:
        return [];
    }
  };

  const currentResults = getCurrentResults();

  if (!currentResults || currentResults.length === 0) {
    return <div>Loading...</div>;
  }

  const renderMediaToggle = (type, label) => {
    const isActive = mediaType === type;
    const ButtonComponent = isActive ? PrimaryButton : Black200Button;

    return (
      <ButtonComponent
        key={type}
        name={label}
        onClick={() => {
          setMediaType(type);
          setCurrentPage(1);
        }}
      />
    );
  };

  return (
    <div className="p-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <h1 className="text-5xl font-semibold text-white-100">
            Search Results
          </h1>
          {/* <h2 className="text-l font-regular text-white-100">
            Showing results for:{" "}
            <span className="text-primary-100 font-semibold">{query}</span>
          </h2> */}
          <div className="flex bg-black-100 border border-black-300 rounded-md">
            <input
              type="text"
              placeholder="Search for movies or TV shows"
              className="text-white-100 px-5 py-2.5 w-full bg-black-100 focus:outline-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  navigate(`/search?query=${encodeURIComponent(searchText)}`);
              }}
            />
            <Black200Button
              name="Search"
              icon={Search}
              //   onClick={handleSearch}
              onClick={() =>
                navigate(`/search?query=${encodeURIComponent(searchText)}`)
              }
            />
          </div>
        </div>

        <div className="flex gap-5">
          {renderMediaToggle("movie", "Movies")}
          {renderMediaToggle("tv", "TV Shows")}
        </div>

        <div className="grid grid-cols-6 gap-4 justify-center">
          {currentResults.map((item) => {
            if (!item || !item.id) return null;

            return mediaType === "movie" ? (
              <MovieCard key={`movie-${item.id}`} item={item} />
            ) : (
              <TVShowCard key={`tv-${item.id}`} item={item} />
            );
          })}
        </div>

        <div className="flex justify-center">
          <Black200Button
            name="Load More"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
