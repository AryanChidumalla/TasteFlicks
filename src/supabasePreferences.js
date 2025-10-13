import { supabase } from "./supabaseClient";

export async function upsertMediaItem(media) {
  // media should have id, title, media_type, poster_path, release_date, etc.
  const { data, error } = await supabase.from("media_items").upsert(media, {
    onConflict: "id",
  });

  if (error) {
    console.error("Error upserting media item:", error);
  }

  return data;
}

export async function getUserPreference(userId, mediaId) {
  const { data, error } = await supabase
    .from("user_media_preferences")
    .select("preference")
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    // .single();
    .maybeSingle();

  if (error) {
    console.error("Error fetching preference:", error);
  }

  return data?.preference || null;
}

export async function getMediaByPreference(userId, preference, mediaType) {
  const { data, error } = await supabase
    .from("user_media_preferences")
    .select("media_id")
    .eq("user_id", userId)
    .eq("preference", preference)
    .eq("media_type", mediaType);

  if (error) {
    console.error("Error fetching media by preference:", error);
    return [];
  }

  // Return an array of media IDs
  return data ? data.map((item) => item.media_id) : [];
}

export async function addPreference(userId, mediaId, preference, mediaType) {
  const { data, error } = await supabase.from("user_media_preferences").upsert(
    {
      user_id: userId,
      media_id: mediaId,
      preference,
      media_type: mediaType, // add media_type here
    },
    { onConflict: ["user_id", "media_id"] } // Specify unique key here
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
