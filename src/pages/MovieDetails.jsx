import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails } from "../movieAPI";
import { Bookmark, Star, ThumbsDown, ThumbsUp } from "react-feather";
import { Black200Button, PrimaryButton } from "../buttons";
import {
  addPreference,
  getUserPreference,
  removePreference,
  upsertMediaItem,
} from "../supabasePreferences";
import { useSelector } from "react-redux";

export default function MovieDetails() {
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [movieDetails, setMovieDetails] = useState();
  const [userPreference, setUserPreference] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMovieDetails(id).then(setMovieDetails);
  }, [id]);

  useEffect(() => {
    if (userId) {
      getUserPreference(userId, id).then(setUserPreference);
    }
  }, [userId, id]);

  const handlePreference = useCallback(
    async (preference) => {
      if (!userId) {
        alert("Please login to save your preferences");
        return;
      }
      setIsSaving(true);

      try {
        if (userPreference === preference) {
          await removePreference(userId, id, preference);
          setUserPreference(null);
        } else {
          if (movieDetails) {
            await upsertMediaItem({
              id: movieDetails.id,
              title: movieDetails.title,
              media_type: "movie",
              poster_path: movieDetails.poster_path,
              release_date: movieDetails.release_date,
            });
            await addPreference(userId, id, preference, "movie");
            setUserPreference(preference);
          }
        }
      } catch (error) {
        console.error("Error saving preference:", error);
        alert("Failed to save preference.");
      } finally {
        setIsSaving(false);
      }
    },
    [userId, id, userPreference, movieDetails]
  );

  function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (!movieDetails)
    return <div className="p-10 text-white-100">Loading...</div>;

  const {
    title,
    overview,
    vote_average,
    release_date,
    runtime,
    genres,
    spoken_languages,
    production_countries,
    poster_path,
  } = movieDetails;

  const renderButton = (name, Icon) => {
    const ButtonComponent =
      userPreference === name ? PrimaryButton : Black200Button;
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return (
      <ButtonComponent
        key={name}
        name={displayName}
        icon={Icon}
        onClick={() => handlePreference(name)}
        disabled={isSaving}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10 text-white-100">
      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        {/* Left content */}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl max-w-full truncate">
              {title}
            </h1>
            <div className="bg-black-200 border border-black-300 px-4 py-2 rounded flex items-center gap-2 text-lg font-semibold whitespace-nowrap">
              <Star size={20} />
              {vote_average?.toFixed(1)}
            </div>
          </div>

          <p className="text-base sm:text-lg leading-relaxed mb-6">
            {overview}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-base sm:text-lg">
            <div>
              <span className="font-semibold">Release Date: </span>
              {new Date(release_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div>
              <span className="font-semibold">Runtime: </span>
              {formatRuntime(runtime)}
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2 items-center">
              <span className="font-semibold mr-2">Genres: </span>
              {genres?.map((genre) => (
                <div
                  key={genre.id}
                  className="bg-black-200 border border-black-300 rounded-full px-4 py-1 text-sm whitespace-nowrap"
                >
                  {genre.name}
                </div>
              ))}
            </div>
            <div>
              <span className="font-semibold">Language: </span>
              {spoken_languages?.[0]?.english_name}
            </div>
            <div>
              <span className="font-semibold">Country: </span>
              {production_countries?.[0]?.name}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {renderButton("like", ThumbsUp)}
            {renderButton("dislike", ThumbsDown)}
            {renderButton("watchlist", Bookmark)}
          </div>
        </div>

        {/* Poster */}
        <img
          src={`https://image.tmdb.org/t/p/w500${poster_path}`}
          alt={`${title} poster`}
          className="w-full max-w-xs md:max-w-[350px] rounded self-start"
          loading="lazy"
        />
      </div>

      <RelatedMovies />
    </div>
  );
}

function RelatedMovies() {
  return (
    <div className="flex flex-col p-4 sm:p-6 md:p-10 gap-5 max-w-7xl mx-auto text-white-100">
      <h2 className="font-semibold text-2xl sm:text-3xl">Related Movies</h2>
      {/* Content for related movies goes here later */}
      <p className="text-white-300">Coming soon...</p>
    </div>
  );
}
