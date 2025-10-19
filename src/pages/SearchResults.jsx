import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { searchMovies, searchTVShows } from "../movieAPI";
import { MovieCard } from "../components/movieCard";
import { Black200Button, PrimaryButton } from "../buttons";
import TVShowCard from "../components/tvShowCard";

function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const [mediaType, setMediaType] = useState("movie"); // 'movie' or 'tv'

  // Search results
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTVResults] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  // Unified fetch function based on media type
  const fetchResults = (type, page) => {
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
  }, [mediaType, query]);

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
    return <div className="text-center text-white-200 mt-10">Loading...</div>;
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
