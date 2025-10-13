import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getTVShowDetails } from "../movieAPI";
import { Bookmark, Star, ThumbsDown, ThumbsUp } from "react-feather";
import { Black200Button, PrimaryButton } from "../buttons";
import {
  addPreference,
  getUserPreference,
  removePreference,
  upsertMediaItem,
} from "../supabasePreferences";
import { useSelector } from "react-redux";
import ISO6391 from "iso-639-1";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

export default function TVShowDetails() {
  const { id } = useParams();

  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [tvDetails, setTVDetails] = useState();
  const [userPreference, setUserPreference] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getTVShowDetails(id).then(setTVDetails);
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
          if (tvDetails) {
            await upsertMediaItem({
              id: tvDetails.id,
              title: tvDetails.name,
              media_type: "tv",
              poster_path: tvDetails.poster_path,
              release_date: tvDetails.first_air_date,
            });
            await addPreference(userId, id, preference, "tv");
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
    [userId, id, userPreference, tvDetails]
  );

  if (!tvDetails)
    return (
      <div className="p-10 text-white-100 text-center text-lg">Loading...</div>
    );

  countries.registerLocale(enLocale);
  const languageName = ISO6391.getName(tvDetails?.original_language) || "N/A";
  const countryName =
    countries.getName(tvDetails?.origin_country?.[0], "en") || "N/A";

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
        {/* Left info */}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl max-w-full truncate">
              {tvDetails.name}
            </h1>
            <div className="bg-black-200 border border-black-300 px-4 py-2 rounded flex items-center gap-2 text-lg font-semibold whitespace-nowrap">
              <Star size={20} />
              {tvDetails.vote_average?.toFixed(1)}
            </div>
          </div>

          <p className="text-base sm:text-lg leading-relaxed mb-6">
            {tvDetails.overview}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-base sm:text-lg">
            <div>
              <span className="font-semibold">First Air Date: </span>
              {new Date(tvDetails.first_air_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div>
              <span className="font-semibold">Seasons: </span>
              {tvDetails.number_of_seasons}
            </div>

            <div>
              <span className="font-semibold">Episodes: </span>
              {tvDetails.number_of_episodes}
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-2 items-center">
              <span className="font-semibold mr-2">Genres: </span>
              {tvDetails.genres?.map((genre) => (
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
              {languageName}
            </div>

            <div>
              <span className="font-semibold">Country: </span>
              {countryName}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              renderButton("like", ThumbsUp),
              renderButton("dislike", ThumbsDown),
              renderButton("watchlist", Bookmark),
            ]}
          </div>
        </div>

        {/* Poster */}
        <img
          src={`https://image.tmdb.org/t/p/w500${tvDetails.poster_path}`}
          alt={`${tvDetails.name} poster`}
          className="w-full max-w-xs md:max-w-[350px] rounded self-start"
          loading="lazy"
        />
      </div>

      <RelatedTVShows />
    </div>
  );
}

function RelatedTVShows() {
  return (
    <div className="flex flex-col p-4 sm:p-6 md:p-10 gap-5 max-w-7xl mx-auto text-white-100">
      <h2 className="font-semibold text-2xl sm:text-3xl">Related TV Shows</h2>
      {/* Add related TV shows content here later */}
      <p className="text-white-300">Coming soon...</p>
    </div>
  );
}
