import { getUserRecommendations } from "./getUserRecommendations";
import { supabase } from "../supabaseClient";

export async function getCachedRecommendations(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("user_recommendations")
      .select("recommendations")
      .eq("user_id", userId)
      .single(); // ✅ directly get one row

    if (error) {
      console.error("Error fetching cached recommendations:", error);
      return null;
    }

    if (data?.recommendations?.length > 0) {
      console.log("✅ Returning cached recommendations");
      return data.recommendations;
    }

    console.log("⚙️ No cached recommendations found");
    return null;
  } catch (err) {
    console.error("Unexpected error in getCachedRecommendations:", err);
    return null;
  }
}

export async function generateAndCacheRecommendations(userId) {
  if (!userId) return [];

  try {
    console.log("⚙️ Generating new recommendations...");
    const recommendations = await getUserRecommendations(userId);

    if (!recommendations?.length) {
      console.warn("⚠️ No recommendations generated");
      return [];
    }

    const { error } = await supabase
      .from("user_recommendations")
      .upsert({ user_id: userId, recommendations }, { onConflict: "user_id" });

    if (error) {
      console.error("Error caching new recommendations:", error);
    } else {
      console.log("✅ Cached new recommendations in Supabase");
    }

    return recommendations;
  } catch (err) {
    console.error("Unexpected error in generateAndCacheRecommendations:", err);
    return [];
  }
}

export async function fetchCachedRecommendations(userId) {
  const cached = await getCachedRecommendations(userId);
  if (cached) return cached;

  return await generateAndCacheRecommendations(userId);
}
