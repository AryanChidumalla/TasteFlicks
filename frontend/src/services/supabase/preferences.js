import { supabase } from "./client";

export async function upsertMediaItem(media) {
  const { data, error } = await supabase.from("media_items").upsert(media, {
    onConflict: "id",
  });
  if (error) {
    console.error("Error upserting media item:", error);
  }
  return data;
}

export async function getUserPreference(userId, mediaId) {
  // ⚡ Upgraded selector to check both column types safely
  const { data, error } = await supabase
    .from("user_media_preferences")
    .select("preference, not_interested, rating")
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching preference:", error);
  }
  return data || null;
}

export async function getMediaByPreference(userId, mediaType) {
  let query = supabase
    .from("user_media_preferences")
    .select("media_id, rating, watchlist, not_interested")
    .eq("user_id", userId)
    .eq("media_type", mediaType);

  // if (preference === "like") {
  //   query = query.gte("rating", 7);
  // } else if (preference === "dislike") {
  //   query = query.lte("rating", 4);
  // } else if (preference === "not_interested") {
  //   // ⚡ Separate query handler to fetch explicit exclusion sets
  //   query = query.eq("not_interested", true);
  // } else {
  //   return [];
  // }

  const { data, error } = await query;
  if (error) {
    console.error(`Error fetching media by type (${mediaType}):`, error);
    return [];
  }
  return data;
}

export async function getMovieRatings(userId) {
  const { data, error } = await supabase
    .from("user_media_preferences")
    .select("media_id, rating, not_interested") // ⚡ Fetch the exclusion key
    .eq("user_id", userId)
    .eq("media_type", "movie");

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// ⚡ Refactored action to write the absolute boolean flag to Supabase
export async function toggleNotInterested(
  userId,
  mediaId,
  mediaType,
  currentState,
) {
  const { data, error } = await supabase.from("user_media_preferences").upsert(
    {
      user_id: userId,
      media_id: mediaId,
      media_type: mediaType,
      not_interested: !currentState, // Toggle true/false state
    },
    { onConflict: ["user_id", "media_id"] },
  );

  if (error) {
    console.error("Error toggling not_interested flag state:", error);
  }
  return data;
}

export async function addPreference(userId, mediaId, preference, mediaType) {
  const { data, error } = await supabase.from("user_media_preferences").upsert(
    {
      user_id: userId,
      media_id: mediaId,
      preference,
      media_type: mediaType,
    },
    { onConflict: ["user_id", "media_id"] },
  );
  if (error) {
    console.error("Error adding preference:", error);
  }
  return data;
}

export async function removePreference(userId, mediaId, preference) {
  const { data, error } = await supabase
    .from("user_media_preferences")
    .delete()
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    .eq("preference", preference);

  if (error) {
    console.error("Error removing preference:", error);
  }
  return data;
}

export async function removeFromWatchlist(userId, mediaId, type) {
  const { error } = await supabase.from("user_preferences").delete().match({
    user_id: userId,
    media_id: mediaId,
    type: "watchlist",
    media_type: type,
  });
  if (error) throw error;
  return true;
}

export async function getRecentActivity(userId, limit = 10) {
  const { data, error } = await supabase
    .from("user_media_preferences")
    .select("media_id, preference, media_type, created_at, not_interested")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
  return data;
}
