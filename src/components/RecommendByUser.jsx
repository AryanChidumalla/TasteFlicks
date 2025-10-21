import { useEffect, useState } from "react";
import axios from "axios";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails } from "../movieAPI";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// export function useUserRecommendations() {
//   // Fetch full movie details from TMDB
//   const fetchDetailsForRecommendations = async (movieIds) => {
//     try {
//       const details = await Promise.all(
//         movieIds.map((id) => getMovieDetails(id))
//       );
//       setRecommendations(details);
//     } catch {
//       setError("Failed to load movie details.");
//     }
//   };

//   // Fetch recommendations from FastAPI backend
//   const getUserRecommendations = async () => {
//     if (!likedIds) {
//       console.log("here");
//       setError("Please like some movies first!");
//       return;
//     }

//     console.log("not here");

//     setLoading(true);
//     setError("");
//     setRecommendations([]);

//     try {
//       const res = await axios.get(`http://127.0.0.1:8000/recommend/by_user`, {
//         params: { liked_ids: likedIds, disliked_ids: dislikedIds },
//       });

//       const data = res.data;

//       console.log(data);

//       if (data.status === "not_found" || !data.recommendations?.length) {
//         setError(data.message || "No recommendations found.");
//         return;
//       }

//       const movieIds = data.recommendations.map((rec) => rec.id);
//       await fetchDetailsForRecommendations(movieIds);
//     } catch {
//       setError("Error fetching recommendations.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   console.log(likedIds, dislikedIds);

//   // Return data instead of rendering JSX
//   return {
//     loading,
//     error,
//     recommendations,
//     likedIds,
//     dislikedIds,
//     setLikedIds,
//     setDislikedIds,
//     getUserRecommendations,
//   };
// }

export function RecommendedToUser() {
  const user = useSelector((state) => state.user.user);
  const userData = useSelector((state) => state.user.data);
  const userId = user?.id;

  const [likedIds, setLikedIds] = useState([]);
  const [dislikedIds, setDislikedIds] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's liked/disliked movie IDs from Supabase
  useEffect(() => {
    async function fetchUserPreferences() {
      if (!userId) return;
      if (userData?.movieStats && userData?.tvStats) return;

      setLoading(true);
      try {
        const [likedMovieIds, dislikedMovieIds] = await Promise.all([
          getMediaByPreference(userId, "like", "movie"),
          getMediaByPreference(userId, "dislike", "movie"),
        ]);

        setLikedIds(likedMovieIds);
        setDislikedIds(dislikedMovieIds);
      } catch {
        setError("Error loading user preferences");
      } finally {
        setLoading(false);
      }
    }

    fetchUserPreferences();
  }, [userId]);

  // Fetch recommendations when liked/disliked IDs are ready
  useEffect(() => {
    if (likedIds.length || dislikedIds.length) {
      getUserRecommendations(likedIds, dislikedIds);
    }
  }, [likedIds, dislikedIds]);

  // Function to fetch recommendations and movie details
  const getUserRecommendations = async (likedIds, dislikedIds) => {
    setLoading(true);
    try {
      // For testing
      //   const res = await axios.get("http://127.0.0.1:8000/recommend/by_user", {
      //     params: {
      //       liked_ids: likedIds.join(","),
      //       disliked_ids: dislikedIds.join(","),
      //     },
      //   });

      //   For Production
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/recommend/by_user`,
        {
          params: {
            liked_ids: likedIds.join(","),
            disliked_ids: dislikedIds.join(","),
          },
        }
      );

      const data = res.data;

      if (data.status === "not_found" || !data.recommendations?.length) {
        setError(data.message || "No recommendations found.");
        setRecommendations([]);
        return;
      }

      const movieIds = data.recommendations.map((rec) => rec.id);

      const details = await Promise.all(
        movieIds.map((id) => getMovieDetails(id))
      );
      setRecommendations(details);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Error fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  console.log(recommendations);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && recommendations.length > 0 && (
        <div className="p-6 sm:p-10 flex flex-col gap-6">
          <div>
            <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
              Recommended for You
            </h2>
            <p className="text-white-200 text-sm sm:text-base">
              Curated films we think are worth your time.
            </p>
          </div>

          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar pb-2 sm:pb-4">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
                className="flex flex-shrink-0 w-[280px] sm:w-[340px] md:w-[400px] bg-black-200 border border-black-300 text-white-100 rounded-lg overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all"
              >
                {/* Poster */}
                <div className="w-[100px] sm:w-[120px] md:w-[150px] flex-shrink-0 relative">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt="movie poster"
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                  {/* Vote Average */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                    {item.vote_average.toFixed(1)}
                  </div>
                  {/* Adult Badge */}
                  {item.adult && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                      18+
                    </div>
                  )}
                </div>

                {/* Text Info */}
                <div className="p-3 flex flex-col gap-2 justify-start flex-grow">
                  <div className="font-semibold text-base sm:text-lg md:text-xl leading-snug line-clamp-2">
                    {item.title}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white-200">
                    <div>{item.release_date?.slice(0, 4)}</div>
                    <div className="text-white-300">·</div>
                    <div>{`${Math.floor(item.runtime / 60)}h ${
                      item.runtime % 60
                    }m`}</div>
                  </div>

                  <div className="flex flex-wrap gap-x-2 gap-y-1 items-center text-xs sm:text-sm text-white-200">
                    {item.genres && item.genres.length > 0 ? (
                      item.genres.map((genre, index) => (
                        <span key={genre.id} className="flex items-center">
                          {genre.name}
                          {index < item.genres.length - 1 && (
                            <span className="text-white-300">·</span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-white-300">N/A</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
