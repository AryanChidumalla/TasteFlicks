import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  getTVShowDetails,
  getTVShowVideos, // New API function
  getTVShowCredits, // New API function
  getTVWatchProviders,
  getSimilarTVShows, // New API function
} from "../movieAPI";
import { Bookmark, ThumbsDown, ThumbsUp, Star } from "react-feather";
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
import TVShowCard from "../components/tvShowCard";

// --- Setup i18n ---
countries.registerLocale(enLocale);

// --- Constants ---
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const YOUTUBE_EMBED_BASE_URL = "https://www.youtube.com/embed/";

// --- Utility Functions ---
// Note: Runtime is usually handled differently for TV (episode runtimes) but formatRuntime is generic.

// --- Loading & Error Components (Reused/Adapted from MovieDetails) ---

function SkeletonLoader() {
  return (
    <div className="p-10 text-white-100 animate-pulse">
      <div className="h-[50vh] bg-black-300 w-full rounded-lg mb-10" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="w-full max-w-sm mx-auto md:mx-0">
          <div className="h-96 bg-black-300 rounded-lg w-full" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 w-3/4 bg-black-300 rounded" />
          <div className="h-4 w-full bg-black-300 rounded" />
          <div className="h-4 w-5/6 bg-black-300 rounded" />
          <div className="h-4 w-4/6 bg-black-300 rounded" />
        </div>
      </div>
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="p-10 text-red-500 text-center">
      ⚠️ Sorry, failed to load TV show details. Please try again.
    </div>
  );
}

// --- Extracted Sub-Components (Reused/Adapted) ---

function TVVideoGallery({ videos }) {
  if (videos.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
      <h2 className="text-2xl font-semibold mb-4">Gallery (Trailers)</h2>
      <div className="overflow-x-auto snap-x snap-mandatory">
        <div className="flex gap-6 pb-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="min-w-[320px] w-[320px] flex-shrink-0 rounded-lg overflow-hidden snap-center"
            >
              <iframe
                width="320"
                height="180"
                src={`${YOUTUBE_EMBED_BASE_URL}${video.key}`}
                title={`${video.name} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg w-full h-[180px]"
                aria-label={`Video: ${video.name}`}
              />
              <p className="mt-2 text-sm text-white-100 font-medium">
                {video.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TVCastSlider({ cast }) {
  if (!cast || cast.length === 0) return null;

  // TV uses Aggregate Credits, so character may be an array, showing the first one
  const visibleCast = cast.slice(0, 15);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
      <h2 className="text-2xl font-semibold mb-4">Cast</h2>
      <div className="overflow-x-auto snap-x snap-mandatory">
        <div className="flex gap-6 pb-4">
          {visibleCast.map((actor) => (
            <div
              key={actor.id}
              className="min-w-[120px] w-[120px] flex-shrink-0 text-center snap-start"
            >
              {actor.profile_path ? (
                <img
                  src={`${IMAGE_BASE_URL}/w185${actor.profile_path}`}
                  alt={`${actor.name} profile`}
                  className="rounded-lg w-full h-auto object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="bg-black-300 rounded-lg h-[180px] flex items-center justify-center"
                  aria-label={`No image available for ${actor.name}`}
                >
                  <span className="text-white-300 text-sm">No Image</span>
                </div>
              )}
              <p className="mt-2 font-medium text-sm">{actor.name}</p>
              <p className="text-xs text-white-300">
                {/* Display the first character name or N/A */}
                {actor.roles?.[0]?.character || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TVCrewList({ crew }) {
  if (!crew || crew.length === 0) return null;

  // Get directors
  const directors = crew.filter((c) => c.department === "Directing");

  const directingCrew = crew.filter((c) => c.department === "Directing");

  const uniqueDirectingCrew = directingCrew.filter(
    (person, index, self) => self.findIndex((p) => p.id === person.id) === index
  );

  // Get all unique crew by ID (to avoid duplicates)
  const uniqueCrew = crew.filter(
    (person, index, self) => self.findIndex((p) => p.id === person.id) === index
  );

  // Remove directors from main crew list
  const otherCrew = uniqueCrew.filter(
    (person) => !directors.some((d) => d.id === person.id)
  );

  // Aggregate all unique jobs for each crew member
  const crewToDisplay = otherCrew.map((person) => {
    // console.log(person);

    const jobs = crew.filter((c) => c.id === person.id).map((c) => c.job);
    return {
      id: person.id,
      name: person.name,
      job: person.department,
    };
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
      <h2 className="text-2xl font-semibold mb-4">Crew</h2>

      {/* Highlight Director(s) */}
      {directors.length > 0 && (
        <div className="mb-6 border-b border-black-300 pb-4">
          <p className="font-bold text-lg text-primary-400">Director(s):</p>
          <p className="text-base">{directors.map((d) => d.name).join(", ")}</p>
        </div>
      )}

      {/* Display the rest of the crew with jobs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-h-60 overflow-y-auto">
        {crewToDisplay.map((person) => (
          <div key={person.id}>
            <p className="font-medium">{person.name}</p>
            <p className="text-sm text-white-300">{person.job}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TVWatchProviders({ providers }) {
  if (!providers?.flatrate) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
      <h2 className="text-2xl font-semibold mb-4">Available to Stream</h2>
      <div className="flex gap-4 items-center flex-wrap">
        {providers.flatrate.map((provider) => (
          <div key={provider.provider_id} className="text-center">
            <img
              src={`${IMAGE_BASE_URL}/w45${provider.logo_path}`}
              alt={`${provider.provider_name} logo`}
              className="rounded-md w-12 h-12 mx-auto"
              loading="lazy"
            />
            <p className="text-sm text-white-300 mt-1">
              {provider.provider_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main TVShowDetails Component ---

export default function TVShowDetails() {
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [tvDetails, setTVDetails] = useState(null);
  const [videos, setVideos] = useState([]);
  const [credits, setCredits] = useState(null);
  const [providers, setProviders] = useState(null);
  const [userPreference, setUserPreference] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [relatedTVShows, setRelatedMovies] = useState([]);

  // Consolidated API Fetching
  useEffect(() => {
    const fetchData = async () => {
      setStatus("loading");
      try {
        const [
          details,
          videosData,
          creditsData,
          providersData,
          similarTVShows,
        ] = await Promise.all([
          getTVShowDetails(id),
          getTVShowVideos(id),
          getTVShowCredits(id),
          getTVWatchProviders(id),
          getSimilarTVShows(id),
        ]);

        if (details && details.success === false)
          throw new Error(details.status_message || "TV show not found.");

        setTVDetails(details);
        setVideos(videosData);
        setCredits(creditsData);
        setRelatedMovies(similarTVShows?.results || []);

        const countryKey = providersData?.US
          ? "US"
          : providersData?.IN
          ? "IN"
          : Object.keys(providersData || {})[0];
        setProviders(providersData?.[countryKey]);

        setStatus("success");
      } catch (error) {
        console.error("Error fetching TV show data:", error);
        setStatus("error");
      }
    };
    fetchData();
  }, [id]);

  // Fetch user preference
  useEffect(() => {
    if (userId && status === "success") {
      getUserPreference(userId, id)
        .then(setUserPreference)
        .catch(console.error);
    }
  }, [userId, id, status]);

  // useMemo for derived videos data
  const galleryVideos = useMemo(() => {
    return [...videos]
      .filter((v) => v.site === "YouTube" && v.type === "Trailer")
      .reverse();
  }, [videos]);

  // Memoized Preference Handler
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
        alert("Failed to save preference. See console for details.");
      } finally {
        setIsSaving(false);
      }
    },
    [userId, id, userPreference, tvDetails]
  );

  // Memoized Render Button
  const renderButton = useCallback(
    (name, Icon) => {
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
          aria-label={`${displayName} preference button`}
        />
      );
    },
    [userPreference, isSaving, handlePreference]
  );

  if (status === "loading") return <SkeletonLoader />;
  if (status === "error") return <ErrorMessage />;
  if (!tvDetails) return <ErrorMessage />;

  const {
    name,
    overview,
    first_air_date,
    number_of_seasons,
    number_of_episodes,
    genres,
    spoken_languages,
    origin_country,
    poster_path,
    backdrop_path,
    vote_average,
  } = tvDetails;

  // Data Formatting
  const formattedAirDate = first_air_date
    ? new Date(first_air_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const genreNames = genres?.map((genre) => genre.name).join(", ");

  const languageNames =
    spoken_languages
      ?.map((l) => ISO6391.getName(l.iso_639_1))
      .filter(Boolean)
      .join(", ") || "N/A";

  const countryNames =
    origin_country
      ?.map((c) => countries.getName(c, "en"))
      .filter(Boolean)
      .join(", ") || "N/A";

  return (
    <div className="text-white-100">
      {/* Backdrop */}
      <div
        className="w-full h-[50vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${
            backdrop_path ? `${IMAGE_BASE_URL}/original${backdrop_path}` : ""
          })`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Poster */}
        <div className="w-full max-w-sm mx-auto md:mx-0">
          {poster_path ? (
            <img
              src={`${IMAGE_BASE_URL}/w500${poster_path}`}
              alt={`${name} poster`}
              className="rounded-lg shadow-lg w-full"
              loading="lazy"
            />
          ) : (
            <div className="bg-black-300 rounded-lg h-[450px] flex items-center justify-center">
              <span className="text-white-300 text-lg">Poster Unavailable</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>
          <p className="text-lg md:text-l text-white-300">
            {overview || "No overview available."}
          </p>

          <div className="space-y-3 text-base sm:text-lg">
            <div>
              <span className="font-semibold">Rating:</span>{" "}
              {vote_average ? `${vote_average.toFixed(1)} / 10` : "N/A"}
            </div>
            <div>
              <span className="font-semibold">First Air Date:</span>{" "}
              {formattedAirDate}
            </div>
            <div>
              <span className="font-semibold">Seasons/Episodes:</span>{" "}
              {`${number_of_seasons || "N/A"} / ${number_of_episodes || "N/A"}`}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold mr-2">Genre:</span>
              {genres && genres.length > 0 ? (
                genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-black-200 border border-black-300 rounded-full px-4 py-1 text-sm"
                  >
                    {genre.name}
                  </span>
                ))
              ) : (
                <span className="text-white-300">N/A</span>
              )}
            </div>
            <div>
              <span className="font-semibold">Language:</span> {languageNames}
            </div>
            <div>
              <span className="font-semibold">Country:</span> {countryNames}
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              {renderButton("like", ThumbsUp)}
              {renderButton("dislike", ThumbsDown)}
              {renderButton("watchlist", Bookmark)}
            </div>
          </div>
        </div>
      </div>

      <hr className="max-w-7xl mx-auto border-black-300" />
      <TVVideoGallery videos={galleryVideos} />

      <hr className="max-w-7xl mx-auto border-black-300" />
      <TVCastSlider cast={credits?.cast} />

      <hr className="max-w-7xl mx-auto border-black-300" />
      <TVCrewList crew={credits?.crew} />

      <hr className="max-w-7xl mx-auto border-black-300" />
      <TVWatchProviders providers={providers} />

      <RelatedTVShows relatedTVShows={relatedTVShows} />
    </div>
  );
}

function RelatedTVShows({ relatedTVShows }) {
  if (!relatedTVShows || relatedTVShows.length === 0)
    return (
      <div className="text-white-300 text-center mt-6">
        No related TV shows found.
      </div>
    );

  return (
    <div className="flex flex-col p-4 sm:p-6 md:p-10 gap-5 max-w-7xl mx-auto text-white-100">
      <h2 className="font-semibold text-2xl sm:text-3xl">Related TV Shows</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {relatedTVShows.map((tv) => (
          <TVShowCard key={tv.id} item={tv} />
        ))}
      </div>
    </div>
  );
}
