import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MediaCard } from "../components/ui/MediaCard";
import { Black200Button, PrimaryButton } from "../components/ui/buttons";
import {
  getPersonMovieCredits,
  getPersonTVCredits,
} from "../services/tmdb/api";

export default function PersonMedia() {
  const { personId } = useParams();

  const [mediaType, setMediaType] = useState("movie"); // 'movie' or 'tv'
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTVResults] = useState([]);
  const [personName, setPersonName] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchPersonCredits = async () => {
      if (!personId) return;
      setLoading(true);

      try {
        const data =
          mediaType === "movie"
            ? await getPersonMovieCredits(personId)
            : await getPersonTVCredits(personId);

        if (isCancelled) return;

        if (data?.person_name && !personName) {
          setPersonName(data.person_name);
        }

        const results = Array.isArray(data?.results) ? data.results : [];

        if (mediaType === "movie") {
          setMovieResults(results);
        } else {
          setTVResults(results);
        }
      } catch (err) {
        console.error("Error fetching person credits:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    setVisibleCount(18);
    fetchPersonCredits();

    return () => {
      isCancelled = true;
    };
  }, [personId, mediaType, personName]);

  const currentResults = mediaType === "movie" ? movieResults : tvResults;
  const displayedResults = currentResults.slice(0, visibleCount);
  const hasMore = visibleCount < currentResults.length;

  const renderMediaToggle = (type, label) => {
    const isActive = mediaType === type;
    const ButtonComponent = isActive ? PrimaryButton : Black200Button;

    return (
      <ButtonComponent
        key={type}
        name={label}
        onClick={() => {
          if (mediaType === type) return;
          setMediaType(type);
        }}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white-100 space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white-100 to-white-300 bg-clip-text text-transparent">
          {personName ? `${personName}'s Filmography` : "Filmography"}
        </h1>
        <p className="text-xs sm:text-sm text-white-300">
          Browse through movies and television contributions.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-3 bg-white/[0.01] border border-white/[0.04] p-1.5 rounded-2xl w-max">
        {renderMediaToggle("movie", "Movies")}
        {renderMediaToggle("tv", "TV Shows")}
      </div>

      {/* Main Results Grid */}
      {displayedResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {displayedResults.map((item, index) => {
            if (!item || !item.id) return null;
            return (
              <div
                key={`${mediaType}-${item.id}-${index}`}
                className="transition-transform duration-300 hover:scale-[1.02]"
              >
                <MediaCard item={item} mediaType={mediaType} />
              </div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl text-white-300 text-xs tracking-wide">
            No media credits discovered for this category.
          </div>
        )
      )}

      {/* Pagination Action Section */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Black200Button
            name="Load More"
            onClick={() => setVisibleCount((prev) => prev + 18)}
          />
        </div>
      )}
    </div>
  );
}
