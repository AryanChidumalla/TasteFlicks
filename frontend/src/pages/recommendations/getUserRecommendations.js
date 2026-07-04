import axios from "axios";
import {
  getMediaByPreference,
  getMovieRatings,
} from "../../services/supabase/preferences";
import { getMovieDetails } from "../../services/tmdb/api";

export async function getUserRecommendations(userId) {
  if (!userId) {
    console.warn("❌ getUserRecommendations aborted: No userId provided.");
    return [];
  }

  try {
    // 1. Inspect Supabase raw outputs
    const [likedIds, dislikedIds] = await Promise.all([
      getMediaByPreference(userId, "like", "movie"),
      getMediaByPreference(userId, "dislike", "movie"),
    ]);

    const ratings = await getMovieRatings(userId);

    console.log("📊 Supabase Preference Hydration Logs:", {
      likedIds,
      dislikedIds,
    });

    // Stop early if no likes/dislikes exist yet
    if (!likedIds.length && !dislikedIds.length) {
      console.warn(
        "⚠️ Early exit triggered: Both likedIds and dislikedIds collections are empty.",
      );
      return [];
    }

    // 2. Fetch from the recommendations microservice
    console.log(
      "⚙️ Querying AI model engine at:",
      `${import.meta.env.VITE_API_BASE_URL}/recommend/by_user`,
    );

    const formattedRatings = ratings
      .filter((movie) => movie.rating != null)
      .map((movie) => ({
        id: movie.media_id,
        rating: movie.rating,
      }));

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/recommend/by_user`,
      {
        ratings: formattedRatings,
      },
    );

    console.log("🤖 AI Vector Response Payload Received:", res.data);

    const targetRecs = res.data?.recommendations || [];
    if (!targetRecs.length) {
      console.warn(
        "⚠️ AI Engine successfully responded, but returned 0 recommendation vectors.",
      );
      return [];
    }

    // 3. Resolve TMDB detail records
    const movieIds = targetRecs.map((rec) => rec.id);
    console.log(
      `🎬 Dispatching TMDB API detail queries for ${movieIds.length} indices...`,
    );

    const detailList = await Promise.all(
      movieIds.map((id) =>
        getMovieDetails(id).catch((err) => {
          console.error(
            `❌ TMDB Resolution skipped for ID ${id}:`,
            err.message,
          );
          return null;
        }),
      ),
    );

    const completeData = detailList.filter(Boolean);
    console.log(
      `✅ Successfully loaded ${completeData.length} valid media profiles.`,
    );

    return completeData;
  } catch (error) {
    console.error(
      "💥 Critical Failure inside getUserRecommendations pipeline:",
      error,
    );
    return [];
  }
}
