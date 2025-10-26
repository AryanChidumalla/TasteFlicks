import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MovieCard } from "../components/movieCard";
import TVShowCard from "../components/tvShowCard";
import { Black200Button, PrimaryButton } from "../buttons";
import { getPersonMovieCredits, getPersonTVCredits } from "../movieAPI";

function PersonMedia() {
  const { personId } = useParams(); // URL param (e.g., /person/:personId)

  const [mediaType, setMediaType] = useState("movie"); // 'movie' or 'tv'
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTVResults] = useState([]);
  const [personName, setPersonName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch person credits based on media type
  const fetchPersonCredits = async (type, page = 1) => {
    if (!personId) return;

    try {
      let data;
      switch (type) {
        case "movie":
          data = await getPersonMovieCredits(personId, page);
          break;
        case "tv":
          data = await getPersonTVCredits(personId, page);
          break;
        default:
          return;
      }

      // Extract name once
      if (data?.person_name && !personName) setPersonName(data.person_name);

      const results = Array.isArray(data?.results) ? data.results : [];

      if (page === 1) {
        type === "movie" ? setMovieResults(results) : setTVResults(results);
      } else {
        type === "movie"
          ? setMovieResults((prev) => [...prev, ...results])
          : setTVResults((prev) => [...prev, ...results]);
      }
    } catch (err) {
      console.error("Error fetching person credits:", err);
    }
  };

  // Initial load & when mediaType changes
  useEffect(() => {
    setCurrentPage(1);
    fetchPersonCredits(mediaType, 1);
  }, [personId, mediaType]);

  // Load more (pagination)
  useEffect(() => {
    if (currentPage === 1) return;
    fetchPersonCredits(mediaType, currentPage);
  }, [currentPage]);

  const currentResults = mediaType === "movie" ? movieResults : tvResults;

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
            {personName ? `${personName}'s Media` : "Person's Media"}
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

export default PersonMedia;
