import { supabase } from "./client";

export async function getUserMediaByFilter(userId, mediaType, filters = {}) {
  let query = supabase
    .from("user_media_preferences")
    .select("*")
    .eq("user_id", userId)
    .eq("media_type", mediaType)
    .eq("watched", true);

  // Apply dynamic filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user media:", error);
    return [];
  }

  return data || [];
}

export async function getUserWatchListMedia(userId, mediaType) {
  let query = supabase
    .from("user_media_preferences")
    .select("*")
    .eq("user_id", userId)
    .eq("media_type", mediaType)
    .eq("watchlist", true);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user media:", error);
    return [];
  }

  return data || [];
}
