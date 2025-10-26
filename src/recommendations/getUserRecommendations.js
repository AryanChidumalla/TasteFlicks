import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails } from "../movieAPI";

// getUserRecommendations.js
export async function getUserRecommendations(userId) {
  if (!userId) return [];

  // Fetch liked/disliked IDs
  const [likedIds, dislikedIds] = await Promise.all([
    getMediaByPreference(userId, "like", "movie"),
    getMediaByPreference(userId, "dislike", "movie"),
  ]);

  if (!likedIds.length && !dislikedIds.length) return [];

  // Fetch recommendations
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
  if (!data.recommendations?.length) return [];

  // Fetch movie details
  const movieIds = data.recommendations.map((rec) => rec.id);
  const details = await Promise.all(movieIds.map((id) => getMovieDetails(id)));

  return details;
}
