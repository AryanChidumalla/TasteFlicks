import { getUserRecommendations } from "./getUserRecommendations";
import { supabase } from "../../services/supabase/client";

export async function fetchCachedRecommendations(userId, forceRefresh = false) {
  if (!userId) return [];

  try {
    // 1. If not forcing a refresh, check the cache table
    if (!forceRefresh) {
      const { data, error } = await supabase
        .from("user_recommendations")
        .select("recommendations, updated_at")
        .eq("user_id", userId)
        .single();

      if (!error && data?.recommendations?.length > 0) {
        // ⏰ Optional: Invalidate if older than 24 hours
        const cacheAge = Date.now() - new Date(data.updated_at).getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (cacheAge < oneDay) {
          console.log("✅ Returning fresh cached recommendations");
          return data.recommendations;
        }
      }
    }

    // 2. Cache is stale, empty, or force-refreshed -> Compute new vectors
    console.log(
      "⚙️ Cache stale or forced out. Re-generating recommendations...",
    );
    const freshRecs = await getUserRecommendations(userId);

    if (freshRecs?.length > 0) {
      await supabase.from("user_recommendations").upsert(
        {
          user_id: userId,
          recommendations: freshRecs,
          updated_at: new Date().toISOString(), // Track when it was built
        },
        { onConflict: "user_id" },
      );
      console.log("✅ Cached brand new recommendations in Supabase");
    }

    return freshRecs;
  } catch (err) {
    console.error("Error managing recommendation lifecycle:", err);
    return [];
  }
}
