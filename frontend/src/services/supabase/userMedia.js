import { supabase } from "./client";

// 🔍 get user entry for a media
export const getUserMedia = async (userId, mediaId) => {
  const { data, error } = await supabase
    .from("user_media_preferences")
    .select("*")
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error(error);
  }

  return data;
};

// 💾 upsert (create or update)
export const updateUserMedia = async ({
  userId,
  mediaId,
  mediaType,
  updates,
}) => {
  const payload = {
    user_id: userId,
    media_id: mediaId,
    media_type: mediaType,
    ...updates,
  };

  console.log(payload);

  const { data, error } = await supabase
    .from("user_media_preferences")
    .upsert(payload, {
      onConflict: "user_id,media_id,media_type",
    })
    .select()
    .single();

  if (error) {
    console.error("Upsert error:", error);
    return null;
  }

  return data;
};
