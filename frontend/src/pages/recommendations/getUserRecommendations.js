import axios from "axios";
import { getMovieRatings } from "../../services/supabase/preferences";
import { getMovieDetails } from "../../services/tmdb/api";

export async function getUserRecommendations(userId) {
  if (!userId) {
    console.warn("❌ getUserRecommendations aborted: No userId provided.");
    return [];
  }

  try {
    // 1. Fetch unified ratings and not_interested states from Supabase
    const ratings = await getMovieRatings(userId);

    console.log("📊 Supabase Preference Hydration Logs:", ratings);

    // Stop early only if there is absolutely zero user history
    if (!ratings || ratings.length === 0) {
      console.warn(
        "⚠️ Early exit triggered: User has no recorded movie preferences.",
      );
      return [];
    }

    // 2. Format the payload array for your Python FastAPI backend schema
    const formattedRatings = ratings.map((movie) => ({
      id: movie.media_id,
      rating: movie.rating != null ? movie.rating : 0.0, // Fallback default
      not_interested: !!movie.not_interested, // Explicit boolean flag
    }));

    // Clean up any potential double slashes dynamically
    const targetUrl =
      `${import.meta.env.VITE_API_BASE_URL}/recommend/by_user`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
    console.log("⚙️ Querying AI model engine at:", targetUrl);

    const res = await axios.post(targetUrl, {
      ratings: formattedRatings,
    });

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
