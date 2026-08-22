import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "../services/supabase/client";
import { updateUserMedia } from "../services/supabase/userMedia";
import { upsertMediaItem } from "../services/supabase/preferences";

export function useUserMediaPreferences() {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ["userMediaPreferences", userId],
    queryFn: async () => {
      if (!userId) return { movies: [], tv: [], map: {} };

      const { data, error } = await supabase
        .from("user_media_preferences")
        .select("media_id, media_type, rating, watchlist, not_interested, watched, liked, created_at, updated_at")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user media preferences:", error);
        return { movies: [], tv: [], map: {} };
      }

      const movies = [];
      const tv = [];
      const map = {};

      (data || []).forEach((item) => {
        const type = item.media_type || "movie";
        if (type === "movie") movies.push(item);
        if (type === "tv") tv.push(item);
        map[`${type}_${item.media_id}`] = item;
      });

      return { movies, tv, map };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });

  const getMediaPref = (mediaType, mediaId) => {
    if (!query.data?.map) return null;
    const type = mediaType || "movie";
    return query.data.map[`${type}_${mediaId}`] || null;
  };

  return {
    ...query,
    movies: query.data?.movies || [],
    tv: query.data?.tv || [],
    getMediaPref,
  };
}

export function useUpdateMediaPreference() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async ({ mediaId, mediaType, updates, mediaDetails = null }) => {
      if (!userId) throw new Error("User must be authenticated to update preferences");

      // Ensure media item exists in media_items catalog if details provided
      if (mediaDetails) {
        await upsertMediaItem({
          id: mediaDetails.id,
          title: mediaDetails.title || mediaDetails.name,
          media_type: mediaType,
          poster_path: mediaDetails.poster_path,
          release_date: mediaDetails.release_date || mediaDetails.first_air_date,
        });
      }

      const result = await updateUserMedia({
        userId,
        mediaId,
        mediaType,
        updates,
      });

      return result;
    },
    onSuccess: (_data, variables) => {
      if (!userId) return;

      // Invalidate relevant queries to keep all UI components synchronized
      queryClient.invalidateQueries({
        queryKey: ["userMediaPreferences", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userProfileData", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["recentActivity", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userMedia", userId, variables.mediaId],
      });
      queryClient.invalidateQueries({
        queryKey: ["recommended-movies", userId],
      });
    },
  });
}
